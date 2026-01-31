const express = require('express')
const router = express.Router()
const { registerAsCourseInstructor,getAllCourseInstructors,getCourseInstructorById,deleteCourseInstructor } = require('../controllers/course-instructor.controller')
router.post('/:courseId', registerAsCourseInstructor) // register current teacher as course instructor for a course
router.get('/', getAllCourseInstructors) // get all course instructors of a course/teacher/role
router.get('/:id', getCourseInstructorById)
router.delete('/:id', deleteCourseInstructor) // delete course instructor by id
module.exports = router