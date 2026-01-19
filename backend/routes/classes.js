const express = require('express');
const Class = require('../models/Class');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Create class
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only teachers can create classes'
      });
    }

    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newClass = await Class.create({
      ...req.body,
      teacher: req.user.id,
      classCode
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { classes: newClass._id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        class: newClass
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get all classes
router.get('/', async (req, res) => {
  try {
    let classes;
    if (req.user.role === 'admin') {
      classes = await Class.find()
        .populate('teacher', 'username email')
        .populate('students', 'username email');
    } else if (req.user.role === 'teacher') {
      classes = await Class.find({ teacher: req.user.id })
        .populate('students', 'username email');
    } else {
      classes = await Class.find({ students: req.user.id })
        .populate('teacher', 'username email');
    }

    res.status(200).json({
      status: 'success',
      results: classes.length,
      data: {
        classes
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get specific class with detailed info
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('students', 'username email');

    if (!classData) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

    // Check if user has access to this class
    if (req.user.role === 'student' && !classData.students.some(s => s._id.toString() === req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        class: classData
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Join class
router.post('/join', async (req, res) => {
  try {
    const { classCode } = req.body;
    
    const classToJoin = await Class.findOne({ classCode });
    if (!classToJoin) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

    if (classToJoin.students.includes(req.user.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Already joined this class'
      });
    }

    classToJoin.students.push(req.user.id);
    await classToJoin.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { classes: classToJoin._id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully joined class'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Remove student from class
router.delete('/:classId/students/:studentId', async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only teachers can remove students from classes'
      });
    }

    const classData = await Class.findById(req.params.classId);
    
    if (!classData) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

    // Check if teacher owns this class
    if (req.user.role === 'teacher' && classData.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to modify this class'
      });
    }

    // Remove student from class
    classData.students = classData.students.filter(
      studentId => studentId.toString() !== req.params.studentId
    );

    await classData.save();

    // Remove class from student's classes array
    await User.findByIdAndUpdate(req.params.studentId, {
      $pull: { classes: req.params.classId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Student removed from class successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only teachers can delete classes'
      });
    }

    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

    // Check if teacher owns this class
    if (req.user.role === 'teacher' && classData.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to delete this class'
      });
    }

    // Remove class from all students' classes arrays
    await User.updateMany(
      { _id: { $in: classData.students } },
      { $pull: { classes: req.params.id } }
    );

    // Remove class from teacher's classes array
    await User.findByIdAndUpdate(classData.teacher, {
      $pull: { classes: req.params.id }
    });

    // Delete the class
    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Leave class (for students)
router.post('/:id/leave', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

    // Remove student from class
    classData.students = classData.students.filter(
      studentId => studentId.toString() !== req.user.id
    );

    await classData.save();

    // Remove class from student's classes array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { classes: req.params.id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully left the class'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;