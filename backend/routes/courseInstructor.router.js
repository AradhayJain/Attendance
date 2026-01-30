const express = require('express')
const router = express.Router()
const { registerAsCourseInstructor,getAllCourseInstructors,getCourseInstructorById,deleteCourseInstructor } = require('../controllers/course.controller')
router.post('/:courseId', registerAsCourseInstructor) // register current teacher as course instructor for a course
router.get('/', getAllCourseInstructors)
router.get('/:id', getCourseInstructorById)
router.delete('/:id', deleteCourseInstructor) // delete course instructor by id
module.exports = router