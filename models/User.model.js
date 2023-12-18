const mongoose=require('mongoose');
const {encrypt}=require("../utils/crypto")

const userSchema=mongoose.Schema({
    googleId:String,
    name:{
        type:String,
        trim:true,
        unique:true,
        required:false,
    },
    email:{
        type:String,
        trim:true,
        unique:true,
        required:[true,"Email is required"]
    },
    created:{
        type:Date,
        default:new Date().toISOString()
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    lastActive:{
        type:String,
        required:false
    },
    active:{
        type:Boolean,
        default:false,
        required:false
    },
    otp:{
        type:String,
        required:true,
        expires:1800
    }
},{
    timestamps:true
})

userSchema.pre("save",async function (next){
    if(!this.isModified('password')){
        return next();
    }
    const hash=await encrypt(this.password);
    this.password=hash;
    next();
})



module.exports=mongoose.model('User',userSchema);