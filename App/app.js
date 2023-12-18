const express=require('express');
const session=require('express-session');
const cookieParser=require('cookie-parser')
const cors=require('cors');
const passport = require('passport');   

const connection=require('../Database/db');

(async function db(){
await connection();
})();

require('dotenv').config();

const app=express();

const PORT=process.env.port || 3000;

app.use(express.json());

app.use(cors());

app.use(cookieParser());

app.use(session({
    secret:'hotdogs-dinx',
    resave:true,
    saveUninitialized:true,
    cookie:{
        secure:true,
        maxAge:36000000
    }
}))

app.use(passport.initialize());

app.use((error,req,res,next)=>{
    console.log(error);
    res.status(500).json({error:error.message})
})

app.use('/api/v1',require('../routes/index.route'));



app.listen(PORT,()=>{
    console.log('Server Started at PORT',PORT);
})