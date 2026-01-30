const express = require('express')
const router = express.Router()
const coordinatorAllowedMiddleware=require('../middleware/allowed/coordinator');
const {addCourse, updateCourse,deleteCourse, getAllCourses, getCourseById} = require('../controllers/course.controller')
router.post('/',addCourse) // only adds a new course. Teacher must separately register as course instructor for the course. (only Course Coordinator can do this) (check course with that course code does'nt already exist).
router.put('/:id',coordinatorAllowedMiddleware,updateCourse)
router.delete('/:id', coordinatorAllowedMiddleware, deleteCourse) //deletes all corresponding course instructors too
router.get('/', getAllCourses)
router.get('/:id', getCourseById)
module.exports = router