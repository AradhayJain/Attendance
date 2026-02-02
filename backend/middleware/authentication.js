const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../utils/errors')

const authenticationMiddleware=(req,res,next)=>{
    const authHeader= req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')) throw new UnauthenticatedError('Token not found');
    const token =authHeader.split(' ')[1];
    // console.log(token);
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { id: payload.id, name: payload.name, email: payload.email, role: payload.role }
        console.log(req.user);
        next();
    }
    catch(error){
        throw new UnauthenticatedError(`Not authorized to access this route`);
    }
}

module.exports = authenticationMiddleware;
