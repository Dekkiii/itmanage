const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const session = require('express-session');
const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

function toggleSection() {
  const section = document.getElementById('students-section');
  section.classList.toggle('hidden');
}


const affineCipher = (input, key) => {
  let output = '';
  const a = key.a;
  const b = key.b;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c >= 65 && c <= 90) {
      output += String.fromCharCode(((a * (c - 65) + b) % 26) + 65);
    } else if (c >= 97 && c <= 122) {
      output += String.fromCharCode(((a * (c - 97) + b) % 26) + 97);
    } else {
      output += input.charAt(i);
    }
  }
  return output;
}


router.get('/addinfo', async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  const userId = session.userId;
  if (!userId) {
    res.redirect('/loginpage');
    
  }else{
    try {
      const user = await prisma.User.findUnique({
        where: {
          id: userId,
        },
      });
      const userType = user.usertype; // assuming that the field for usertype in the User model is called "userType"
      const students = await prisma.Student_Info.findMany({
        where: {
          userId: userId,
        },
      });
      res.render('Addinfo', { students, userId, errors: [], errorMessages: '',  successMessages: ''  });
      console.log(userId);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  }
});
    
  


router.post('/userinfo', [
  check('lastname').isLength({ min: 3}).withMessage('Last name is required')
  .matches(/^[a-zA-Z]*$/)
  .withMessage('Lastname should not contain numbers or special characters')
  .trim(),
  check('firstname').isLength({ min: 3}).withMessage('First name is required').matches(/^[a-zA-Z]*$/)
  .withMessage('Firstname should not contain numbers or special characters')
  .trim(),
  check('middlename').isLength({ min: 3}).withMessage('Middlename is required').matches(/^[a-zA-Z]*$/)
  .withMessage('Middlename should not contain numbers or special characters')
  .trim(),
  check('address').isLength({ min: 3}).withMessage('Address is required').matches(/^[a-zA-Z0-9 ]*$/)
  .withMessage('Address should not contain special characters')
  .trim(),
  check('city').isLength({ min: 3}).notEmpty().withMessage('City is required'),
  check('region').isLength({ min: 1}).notEmpty().withMessage('Region is required'),
  check('country').isLength({ min: 3}).notEmpty().withMessage('Country is required'),
  check('zipcode').isLength({ min: 4, max: 4}).notEmpty().withMessage('Zipcode is required'),
  check('birthdate').notEmpty().withMessage('Birthdate is required'),
  check('gender').notEmpty().withMessage('Gender is required'),
  check('civil_status').notEmpty().withMessage('Civil status is required'),
  check('hobby').notEmpty().withMessage('Civil status is required'),
], async (req, res) => {
  
  // do something with the form data, such as saving it to a database
  const {userId, lastname, firstname, middlename, address, city, region, country, zipcode, birthdate, gender, civil_status, hobby } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    const errorMessages = errors.array().map(error => error.msg);
    console.log(errorMessages);
    return res.render('Addinfo', { errorMessages }); // Pass the errors and an empty array of users to the template
  }

  // Define the affine cipher key
  
  // Encrypt the first and last name using the affine cipher
 
  const affineKey = {
    a: 5,
    b: 8 
  };
  
  try {
    const encryptedLastName = affineCipher(lastname, affineKey);
    const encryptedFirstName = affineCipher(firstname, affineKey);
    const zipcodeInt = parseInt(zipcode, 10);
    const birthdateDate = new Date(birthdate);
    
    // Insert the encrypted data into the database
    await prisma.Student_Info.create({
      data: {
        userId,
        lastname: encryptedLastName,
        firstname: encryptedFirstName,
        middlename,
        address,
        city,
        region,
        country,
        zipcode: zipcodeInt,
        birthdate: birthdateDate,
        gender,
        civil_status,
        hobby: Array.isArray(hobby) ? hobby.join(",") : hobby
      }
    });
    res.render('home', { userId , successMessages: `User Information Added Sucessfully` } );
  } catch (err) {
    console.log(err);
    
  }
});


module.exports = router;
