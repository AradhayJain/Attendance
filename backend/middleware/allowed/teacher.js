const {UnauthenticatedError}= require('../../utils/errors');

// course and enroll endpoint middleware to check if user is teacher
const teacherAllowedMiddleware=(req,res,next)=>{
    if(req.user.role !== 'Teacher'){
        throw new UnauthenticatedError('Not authorized to access this route');
    }
    next();
}

module.exports=teacherAllowedMiddleware;




