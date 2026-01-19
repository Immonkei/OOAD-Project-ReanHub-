const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/assignments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'assignment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, ZIP, JPG, PNG files are allowed.'));
    }
  }
});

// Create assignment
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only teachers can create assignments'
      });
    }

    const newAssignment = await Assignment.create({
      ...req.body,
      teacher: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        assignment: newAssignment
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get assignments for a class
router.get('/class/:classId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      class: req.params.classId 
    }).populate('teacher', 'username')
      .populate('submissions.student', 'username email');

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
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacher', 'username')
      .populate('submissions.student', 'username email')
      .populate('class', 'name');

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

// Submit assignment with file upload
router.post('/:id/submit', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a file'
      });
    }

    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Assignment not found'
      });
    }

    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === req.user.id
    );

    if (existingSubmission) {
      // Delete the uploaded file since submission already exists
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        status: 'fail',
        message: 'Already submitted this assignment'
      });
    }

    assignment.submissions.push({
      student: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.filename, // Store just the filename
      fileSize: req.file.size,
      submittedAt: new Date()
    });

    await assignment.save();

    res.status(200).json({
      status: 'success',
      message: 'Assignment submitted successfully',
      data: {
        submission: {
          fileName: req.file.originalname,
          filePath: req.file.filename
        }
      }
    });
  } catch (error) {
    // Delete the uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Serve uploaded files
router.get('/files/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'fail',
        message: 'File not found'
      });
    }

    // For security, verify that the user has access to this file
    // Students can only download their own submissions or teachers can download any from their assignments
    const assignments = await Assignment.find({
      'submissions.filePath': filename
    }).populate('submissions.student', '_id');

    if (assignments.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'File not found'
      });
    }

    // Check if user has access
    let hasAccess = false;
    
    for (const assignment of assignments) {
      const submission = assignment.submissions.find(sub => sub.filePath === filename);
      if (!submission) continue;

      if (req.user.role === 'teacher' && assignment.teacher.toString() === req.user.id) {
        hasAccess = true;
        break;
      }
      
      if (req.user.role === 'student' && submission.student._id.toString() === req.user.id) {
        hasAccess = true;
        break;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Error downloading file'
    });
  }
});

// Grade assignment submission
router.post('/:id/grade', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only teachers can grade assignments'
      });
    }

    const { submissionId, grade, feedback } = req.body;
    
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Assignment not found'
      });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to grade this assignment'
      });
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'Submission not found'
      });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();

    await assignment.save();

    res.status(200).json({
      status: 'success',
      message: 'Assignment graded successfully',
      data: {
        submission
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
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'Assignment not found'
      });
    }

    if (req.user.role !== 'teacher' || assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to delete this assignment'
      });
    }

    // Delete associated files
    assignment.submissions.forEach(submission => {
      const filePath = path.join(uploadsDir, submission.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

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

module.exports = router;