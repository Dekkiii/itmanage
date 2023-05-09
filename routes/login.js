const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

const prisma = new PrismaClient();

const encryptPassword = (message, key)=> {
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

const decryptPassword = (message, key) =>{
  let decryptedMessage = "";
  for (let i = 0; i < message.length; i++) {
    let charCode = message.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90) {
      decryptedMessage += String.fromCharCode((charCode - 65 - key + 26) % 26 + 65);
    } else if (charCode >= 97 && charCode <= 122) {
      decryptedMessage += String.fromCharCode((charCode - 97 - key + 26) % 26 + 97);
    } else {
      decryptedMessage += message.charAt(i);
    }
  }
  return decryptedMessage;
}
router.get('/', async function(req, res, next) {
  res.render('login', { errorMessage: '' });
});

router.get('/loginpage', async function(req, res, next) {
  res.render('login', { errorMessage: '' });
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const shift = 3; // specify the number of positions to shift
  
  const encryptedPassword = await encryptPassword(password, shift);
  try {
    const user = await prisma.User.findUnique({
      where: { email: username },
    });
    if (!user) {
      res.render('login', { errorMessage: `Incorrect Email / Password.` });
    } else {
      const encryptedPass = user.password;
      const decryptedPassword = decryptPassword(encryptedPass, shift);
      
      const newAttempts = user.login_attempts + 1;
      if (decryptedPassword != password) {
        const lockedUntil = new Date(user.locked_until);
        const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);
     
        if (newAttempts >= 4) {
          // The user is locked out, display an error message
          res.render('login', {
            errorMessage: `Your account is locked until ${new Date(
              lockedUntil
            ).toLocaleString()}. Please try again in ${minutesLeft} Minutes.`,
          });
          await prisma.User.update({
            where: { email: username },
            data: {
              login_attempts: 3,
              locked_until:
                newAttempts === 3
                  ? new Date(Date.now() + 5 * 60000) // add 5 minutes to the current time
                  : user.locked_until,
            },
          });
        } else {
          res.render('login', { errorMessage: `Wrong Password` });
          await prisma.User.update({
            where: { email: username },
            data: {
              login_attempts: newAttempts,
              locked_until:
                newAttempts === 3 ? new Date(Date.now() + 5 * 60000) : null,
            },
          });
        }
      } else if (user.locked_until > new Date()) {
        const lockedUntil = user.locked_until;
        const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);
        res.render('login', {
          errorMessage: `Your account is locked until ${new Date(
            lockedUntil
          ).toLocaleString()}. Please try again in ${minutesLeft} Minutes.`,
        });
      } else {
        const userId = user.id; // get the user ID from the result
        session.userId = userId;
        await prisma.User.update({
          where: { email: username },
          data: { login_attempts: 0 },
        });
        res.redirect('/homepage');
      }
    }
  } catch (err) {
    console.log(err);
    res.render('login', { errorMessage: `Something went wrong.` });
  }
});
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Use the session middleware for this route
router.get('/logout', async (req, res) => {
  
  try {
    // Remove the userId property from the session
    
    const userId = null;
    delete session.userId;
    
    // Redirect to the login page
    res.redirect('/loginpage');
  } catch (err) {
    console.log(userId);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;