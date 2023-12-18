const JWT=require('jsonwebtoken')
const User=require('../models/User.model');
const Token=require('../models/Token.model');
const {sendMail} = require('../utils/emailService');
const {encrypt,compare}=require('../utils/crypto');
const {generateOTP}=require('../utils/otp');
const AppError=require('../utils/error/error');
const crypto = require("crypto");
const JWTSecret=process.env.JWT_SECRET;
const clientURL = process.env.CLIENT_URL;

const signup=async (data)=>{
    let user=await User.findOne({email:data.email});

    if(user){
        throw new Error("Email already exists",422);
    }

    data.otp=generateOTP();
    user=new User(data);
    const token=JWT.sign({id:user._id},JWTSecret)
    await user.save();
    await sendMail(
        user.email,
        "DINX Account Signup request",
        {
          name: user.name,
          otp:data.otp
        },
        "./email/template/signuprequest.handlebars"
      );

    return (data={
        userId:user._id,
        email:user.email,
        name:user.name,
        token:token
    });
   
}


const validateUserSignup=async(email,otp)=>{
    const user=await User.findOne({
        email
    })

    if(!user){
        return [false,'User not found'];
    }

    if(user && user.otp!==otp){
        return [false,'Invalid OTP']
    }

    const updatedUser=await User.findByIdAndUpdate(user._id,{
        $set:{active:true},
    },
    {
        new:true
    })

    await sendMail(
        user.email,
        "DINX Account Verified successfully",
        {
          name: user.name,
        },
        "./email/template/otpsuccess.handlebars"
      );

    console.log(updatedUser);

    return [true,updatedUser];

}

const validSignIn=async(email,password)=>{
    //Checking if user exists in database
    let user=await User.findOne({email});
    if(!user){
        return false;
    }
    let val=compare(password,user.password);
   return val;
}


const requestPasswordReset=async(email)=>{
    const user=await User.findOne({email});
    if(!user) throw new Error("Email does not exist");

    let token=Token.findOne({userId:user._id});
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");

    const hash=await encrypt(resetToken);

    await new Token({
        userId:user._id,
        token:hash,
        createdAt:Date.now()
    }).save();

    const link=`${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;

    sendMail(user.email,"Password Reset Request",{
        name:user.name,
        link:link
    },
    "./email/template/requestPasswordReset.handlebars"
    )

}

const resetPassword = async (userId, token, password,next) => {
    console.log(userId)
    console.log(token)
    let passwordResetToken = await Token.findOne({ userId });
  
    if (!passwordResetToken) {
      throw new AppError("Invalid or expired password reset token",500);
      //throw new Error("Invalid or expired password reset token");
    }
  
    console.log(passwordResetToken.token, token);
  
    let isValid=compare(token, passwordResetToken.token);
    if (!isValid) {
      throw new Error("Invalid or expired password reset token");
    }
  
    const hash = await encrypt(password);
  
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
  
    const user = await User.findById({ _id: userId });
  
    sendMail(
      user.email,
      "Password Reset Successfully",
      {
        name: user.name,
      },
      "./email/template/resetPassword.handlebars"
    );
  
    await passwordResetToken.deleteOne();
  
    return { message: "Password reset was successful" };
};

module.exports={
    signup,
    validateUserSignup,
    validSignIn,
    requestPasswordReset,
    resetPassword
}
