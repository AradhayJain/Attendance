const express = require('express')
const router = express.Router()
const coordinatorAllowedMiddleware=require('../middleware/allowed/coordinator');
const {extractStudents,registerCourse,unenrollCourse,getAllEnrolledCourses,getAllUnenrolledCourses} = require('../controllers/course.controller')

router.post('/extract',coordinatorAllowedMiddleware,extractStudents) //Upload a CSV file of students to send them invitations (mail or app notifications)
router.patch('/:id/register',registerCourse)
router.delete('/:id',unenrollCourse)
router.get('/enrolled', getAllEnrolledCourses)
router.get('/invitations', getAllUnenrolledCourses)

module.exports = router