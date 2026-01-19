const express = require('express');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Create a new quiz
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only teachers can create quizzes'
      });
    }

    const newQuiz = await Quiz.create({
      ...req.body,
      teacher: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        quiz: newQuiz
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get quizzes for a class
router.get('/class/:classId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 
      class: req.params.classId 
    }).populate('teacher', 'username');

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

// Get specific quiz
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('teacher', 'username')
      .populate('class', 'name')
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

// Submit quiz answers
router.post('/:id/submit', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    const { answers } = req.body;

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }

    // Calculate score and detailed results
    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const isCorrect = question.correctAnswer === answers[index];
      if (isCorrect) {
        score += question.points || 1;
      }
      return {
        questionIndex: index,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        userAnswer: answers[index],
        points: question.points || 1
      };
    });

    // Check if already submitted
    const existingSubmission = quiz.submissions.find(
      sub => sub.student.toString() === req.user.id
    );

    if (existingSubmission) {
      return res.status(400).json({
        status: 'fail',
        message: 'Already submitted this quiz'
      });
    }

    quiz.submissions.push({
      student: req.user.id,
      answers,
      score,
      results, // Store detailed results
      submittedAt: new Date()
    });

    await quiz.save();

    res.status(200).json({
      status: 'success',
      data: {
        score,
        totalQuestions: quiz.questions.length,
        maxPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
        results // Return detailed results to frontend
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get student's quiz submission details
router.get('/:id/submission', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('teacher', 'username')
      .populate('class', 'name');

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }

    // Find student's submission
    const submission = quiz.submissions.find(
      sub => sub.student.toString() === req.user.id
    );

    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No submission found for this quiz'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions,
          timeLimit: quiz.timeLimit,
          teacher: quiz.teacher,
          class: quiz.class
        },
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

// Get quiz results (Teacher only) - View all student submissions
router.get('/:id/results', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('submissions.student', 'username email')
      .populate('class', 'name')
      .populate('teacher', 'username');

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }

    // Check if user is teacher of this quiz
    if (req.user.role !== 'teacher' || quiz.teacher._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to view these results'
      });
    }

    // Calculate class statistics
    const totalStudents = quiz.submissions.length;
    const averageScore = totalStudents > 0 
      ? quiz.submissions.reduce((sum, sub) => sum + sub.score, 0) / totalStudents 
      : 0;
    const maxPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    res.status(200).json({
      status: 'success',
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          questions: quiz.questions,
          timeLimit: quiz.timeLimit,
          class: quiz.class,
          teacher: quiz.teacher
        },
        submissions: quiz.submissions,
        statistics: {
          totalStudents,
          averageScore: Math.round(averageScore * 100) / 100,
          maxPoints,
          averagePercentage: Math.round((averageScore / maxPoints) * 100)
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

// Get detailed student submission (Teacher view)
router.get('/:quizId/submissions/:studentId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate('submissions.student', 'username email')
      .populate('teacher', 'username');

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }

    // Check if user is teacher of this quiz
    if (req.user.role !== 'teacher' || quiz.teacher._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to view these results'
      });
    }

    const submission = quiz.submissions.find(
      sub => sub.student._id.toString() === req.params.studentId
    );

    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          questions: quiz.questions
        },
        submission,
        student: submission.student
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Delete quiz (Teacher only)
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }

    if (req.user.role !== 'teacher' || quiz.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to delete this quiz'
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

module.exports = router;