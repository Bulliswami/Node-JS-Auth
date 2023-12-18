const {encrypt,compare}=require('../utils/crypto');

const {generateOTP}=require('../utils/otp');

const User=require('../models/User.model');

const jwt=require('jsonwebtoken');

const {signup,validateUserSignup,validSignIn,requestPasswordReset,resetPassword}=require('../services/auth.service');

module.exports.signUpController=async(req,res,next)=>{
    const signupService=await signup(req.body);
    return res.json(signupService);
}

module.exports.verifyEmail=async(req,res,next)=>{
    const {email,otp}=req.body;
    const user=await validateUserSignup(email,otp,next);
    res.send(user);
}

module.exports.signInUser=async(req,res)=>{
    const {email,password}=req.body;
    const validPassword=await validSignIn(email,password);
    if(validPassword){
        const token=jwt.sign({email},process.env.JWT_SECRET,{expiresIn:"1800s"});
        res.cookie('accessToken',token);
        res.send([{message:'User Logged in successfully',token:token}]) 
    }
    else{
        return res.status(401).json({message:"Invalid Credentials"});
    }
}

module.exports.authenticateToken=(req,res,next)=>{
    const authHeader=req.headers["authorization"];
    
    const token=authHeader && authHeader.split(" ")[1];
    const accessToken = req.cookies.accessToken;
    if(!token){
        return res.status(401).send("Authorization Failed.No access token");
    }
   
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            console.log(err);
            return res.status(403).send('Could not verify token');
        }
        req.user=user;
    });
    next();
}

module.exports.resetPasswordRequestController = async (req, res, next) => {
    const requestPasswordResetService = await requestPasswordReset(
      req.body.email
    );
    return res.json(requestPasswordResetService);
};

module.exports.resetPasswordController=async(req,res)=>{
    try{
        const resetPasswordService = await resetPassword(
            req.body.userId,
            req.body.token,
            req.body.password,
            
          );
          console.log(resetPasswordService);
          return res.json(resetPasswordService);
    }
    catch (error) {
        // Handle the error
        res.status(error.statusCode).json({
          status: error.status,
          message: error.message
        });
      }
};

