const express = require('express')
const router = express.Router()
const coordinatorAllowedMiddleware=require('../middleware/allowed/coordinator');
const {addCourse, updateCourse,deleteCourse, getAllCourses, getCourseById} = require('../controllers/course.controller')
router.post('/',addCourse) // only adds a new course. Teacher must separately register as course instructor for the course. (only Course Coordinator can do this) (check course with that course code does'nt already exist).
router.put('/:id',coordinatorAllowedMiddleware,updateCourse)
router.delete('/:id', coordinatorAllowedMiddleware, deleteCourse) //deletes all corresponding course instructors too and enrollments and Attendance sessions and Attendance records
router.get('/',coordinatorAllowedMiddleware, getAllCourses) //courses created  by current course coordinator by semester and session filter
router.get('/:id', getCourseById)
module.exports = router