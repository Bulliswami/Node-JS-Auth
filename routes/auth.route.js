const router=require('express').Router();
const passport=require('passport');
const { body, validationResult } = require('express-validator');

const {
  validateUser,
} = require('../middlewares/validator/userValidator');

const {signUpController,verifyEmail,signInUser,resetPasswordRequestController,resetPasswordController}=require('../controllers/auth.controller');


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, redirect or respond as needed
  res.redirect('/profile');
});

router.get('/profile', (req, res) => {
  // Access the authenticated user through req.user
  res.send(`Welcome, ${req.user.displayName}!`);
});


router.post('/signup',signUpController);
router.post('/verify',verifyEmail);
router.post('/signin',validateUser,signInUser);
router.post('/requestResetPassword',resetPasswordRequestController);
router.post('/resetPassword',resetPasswordController);


// router.get('/test',authController.authenticateToken,(req,res)=>
//     res.send('Token Verified,Authorization User...')
// );



module.exports=router;



// Configure express-session and passport middlewares...



