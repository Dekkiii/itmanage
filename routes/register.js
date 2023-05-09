const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

const prisma = new PrismaClient();


const encryptPassword = (message, key) => {
  let encryptedMessage = "";
  for (let i = 0; i < message.length; i++) {
    let charCode = message.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90) {
      encryptedMessage += String.fromCharCode((charCode - 65 + key) % 26 + 65);
    } else if (charCode >= 97 && charCode <= 122) {
      encryptedMessage += String.fromCharCode((charCode - 97 + key) % 26 + 97);
    } else {
      encryptedMessage += message.charAt(i);
    }
  }
  return encryptedMessage;
}

router.get('/register', async (req, res, next) => {
  res.render('register', { errors: [], errorMessages: '',errorMessage:'' }); 
});

router.post('/registering', [
  check('firstname').isLength({ min: 1}).withMessage('First name is required'),
  check('lastname').isLength({ min: 1}).withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email address'),
  check('confirmEmail').custom((value, { req }) => {
    if (value !== req.body.email) {
      throw new Error('Email addresses do not match');
    }
    return true;
  }),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
  })
], async (req, res) => {
  const { firstname, lastname, email, password, usertype } = req.body;
  const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.render('register', { errors: errors.array(), errorMessages, errorMessage: `Email already exists, please choose a different one`});
  }
  
  const user = await prisma.User.findUnique({ where: { email } });
  
  if (user) {
   return res.render('register', { errorMessage: `Email already exists, please choose a different one`});
  } else {
    const shift = 3;
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await encryptPassword(password, shift);
    const login_attempts = 0;
    const locked_until = null;
    await prisma.User.create({
      data: {
        firstname,
        lastname,
        email,
        password: encryptedPassword,
        login_attempts,
        locked_until,
        usertype,
      }
    });
  
    return res.redirect('/loginpage');
  }
});



module.exports = router;




