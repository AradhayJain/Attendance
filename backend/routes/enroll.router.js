const express = require('express')
const router = express.Router()
const coordinatorAllowedMiddleware=require('../middleware/allowed/coordinator');
const { uploadSingle } = require('../middleware/multer')
const {extractStudents,registerCourse,unenrollCourse,getAllEnrolledCourses,getAllUnenrolledCourses} = require('../controllers/enroll.controller')

router.post('/extract/:courseId',coordinatorAllowedMiddleware,uploadSingle.single('file'),extractStudents) //Upload a CSV file of students to send them invitations (mail or app notifications)

// student endpoints
router.patch('/:courseId/register',registerCourse)
router.delete('/:courseId',unenrollCourse)
router.get('/enrolled', getAllEnrolledCourses)
router.get('/invitations', getAllUnenrolledCourses)

module.exports = router