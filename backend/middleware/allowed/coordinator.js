const {UnauthenticatedError}= require('../../utils/errors');
const {prisma} = require('../../utils/db/prisma');

// Middleware to check if user is the course coordinator for the course
const coordinatorAllowedMiddleware = async (req, res, next) => {
    const courseId = req.params.id;
    
    if (!courseId) {
        throw new UnauthenticatedError('Course ID is required');
    }
    
    const course = await prisma.course.findUnique({
        where: { id: courseId }
    });
    
    if (!course) {
        throw new UnauthenticatedError('Course not found');
    }
    
    if (course.courseCoordinator !== req.user.id) {
        throw new UnauthenticatedError('Not authorized to access this route');
    }
    
    next();
}

module.exports = coordinatorAllowedMiddleware;




