const express = require('express');
const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');
const router = express.Router();

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Admin access required'
    });
  }
  next();
};

router.use(auth);
router.use(requireAdmin);

// ==================== USER MANAGEMENT ====================

// Get all users (students & teachers)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'teacher'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Create new user (student or teacher)
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Role must be either student or teacher'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists'
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      role
    });

    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: `${role} created successfully`,
      data: { user: newUser }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Role must be student or teacher'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role}`,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// ==================== CLASS MANAGEMENT ====================

// Get all classes
router.get('/classes', async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'username email')
      .populate('students', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { classes }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Admin create class
router.post('/classes', async (req, res) => {
  try {
    const { name, subject, description, teacherId } = req.body;

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher not found'
      });
    }

    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newClass = await Class.create({
      name,
      subject,
      description,
      teacher: teacherId,
      classCode
    });

    await User.findByIdAndUpdate(teacherId, {
      $push: { classes: newClass._id }
    });

    res.status(201).json({
      status: 'success',
      data: { class: newClass }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Delete class
router.delete('/classes/:id', async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id);
    
    if (!classObj) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

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

// ==================== QUIZ MANAGEMENT ====================

// Get all quizzes across all classes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('teacher', 'username email')
      .populate('class', 'name subject')
      .populate('submissions.student', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        quizzes
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get specific quiz with detailed submissions
router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('class', 'name subject')
      .populate('submissions.student', 'username email');

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        quiz
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Create quiz (admin can create quiz for any teacher/class)
router.post('/quizzes', async (req, res) => {
  try {
    const { title, description, classId, teacherId, questions, timeLimit } = req.body;

    // Verify class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

    // Verify teacher exists
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher not found'
      });
    }

    const newQuiz = await Quiz.create({
      title,
      description,
      class: classId,
      teacher: teacherId,
      questions,
      timeLimit: timeLimit || 30
    });

    const populatedQuiz = await Quiz.findById(newQuiz._id)
      .populate('teacher', 'username email')
      .populate('class', 'name subject');

    res.status(201).json({
      status: 'success',
      data: {
        quiz: populatedQuiz
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Delete quiz
router.delete('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get quiz statistics
router.get('/quiz-stats', async (req, res) => {
  try {
    const [
      totalQuizzes,
      totalQuizSubmissions,
      quizzesWithSubmissions
    ] = await Promise.all([
      Quiz.countDocuments(),
      Quiz.aggregate([
        { $unwind: '$submissions' },
        { $count: 'totalSubmissions' }
      ]),
      Quiz.aggregate([
        {
          $project: {
            title: 1,
            submissionCount: { $size: '$submissions' }
          }
        },
        { $sort: { submissionCount: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalQuizzes,
        totalQuizSubmissions: totalQuizSubmissions[0]?.totalSubmissions || 0,
        popularQuizzes: quizzesWithSubmissions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// ==================== ASSIGNMENT MANAGEMENT ====================

// Get all assignments across all classes
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('teacher', 'username email')
      .populate('class', 'name subject')
      .populate('submissions.student', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        assignments
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get specific assignment with submissions
router.get('/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('class', 'name subject')
      .populate('submissions.student', 'username email');

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Assignment not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        assignment
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Admin create assignment for any class
router.post('/assignments', async (req, res) => {
  try {
    const { title, description, classId, teacherId, dueDate, maxPoints } = req.body;

    // Verify class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({
        status: 'fail',
        message: 'Class not found'
      });
    }

    // Verify teacher exists
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher not found'
      });
    }

    const newAssignment = await Assignment.create({
      title,
      description,
      class: classId,
      teacher: teacherId,
      dueDate,
      maxPoints: maxPoints || 100
    });

    const populatedAssignment = await Assignment.findById(newAssignment._id)
      .populate('teacher', 'username email')
      .populate('class', 'name subject');

    res.status(201).json({
      status: 'success',
      data: {
        assignment: populatedAssignment
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Delete assignment
router.delete('/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Assignment not found'
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Grade assignment submission
router.patch('/assignments/:assignmentId/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const { assignmentId, submissionId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Assignment not found'
      });
    }

    // Find and update the submission
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'Submission not found'
      });
    }

    submission.grade = grade;
    if (feedback) submission.feedback = feedback;

    await assignment.save();

    // Update student points if grade is provided
    if (grade) {
      const student = await User.findById(submission.student);
      if (student) {
        // Add points based on grade percentage
        const pointsEarned = Math.round((grade / assignment.maxPoints) * 10); // 10 points max per assignment
        student.points += pointsEarned;
        await student.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Submission graded successfully',
      data: { submission }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get assignment statistics
router.get('/assignment-stats', async (req, res) => {
  try {
    const [
      totalAssignments,
      totalSubmissions,
      assignmentsWithSubmissions,
      averageGrades
    ] = await Promise.all([
      Assignment.countDocuments(),
      Assignment.aggregate([
        { $unwind: '$submissions' },
        { $count: 'totalSubmissions' }
      ]),
      Assignment.aggregate([
        {
          $project: {
            title: 1,
            submissionCount: { $size: '$submissions' },
            gradedCount: {
              $size: {
                $filter: {
                  input: '$submissions',
                  as: 'sub',
                  cond: { $ne: ['$$sub.grade', null] }
                }
              }
            }
          }
        },
        { $sort: { submissionCount: -1 } },
        { $limit: 5 }
      ]),
      Assignment.aggregate([
        { $unwind: '$submissions' },
        { $match: { 'submissions.grade': { $ne: null } } },
        {
          $group: {
            _id: null,
            averageGrade: { $avg: '$submissions.grade' },
            maxGrade: { $max: '$submissions.grade' },
            minGrade: { $min: '$submissions.grade' }
          }
        }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalAssignments,
        totalSubmissions: totalSubmissions[0]?.totalSubmissions || 0,
        popularAssignments: assignmentsWithSubmissions,
        gradeStatistics: averageGrades[0] || { averageGrade: 0, maxGrade: 0, minGrade: 0 }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});
// ==================== SYSTEM STATS ====================

// Update system statistics to include detailed assignment data
router.get('/stats', async (req, res) => {
  try {
    const [
      students, 
      teachers, 
      classes, 
      assignments,
      quizzes,
      totalSubmissions,
      gradedSubmissions
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Class.countDocuments(),
      Assignment.countDocuments(),
      Quiz.countDocuments(),
      Assignment.aggregate([
        { $unwind: '$submissions' },
        { $count: 'total' }
      ]),
      Assignment.aggregate([
        { $unwind: '$submissions' },
        { $match: { 'submissions.grade': { $ne: null } } },
        { $count: 'graded' }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalStudents: students,
        totalTeachers: teachers,
        totalClasses: classes,
        totalAssignments: assignments,
        totalQuizzes: quizzes,
        assignmentStats: {
          totalSubmissions: totalSubmissions[0]?.total || 0,
          gradedSubmissions: gradedSubmissions[0]?.graded || 0,
          submissionRate: assignments > 0 ? Math.round((totalSubmissions[0]?.total || 0) / (assignments * students) * 100) : 0
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;