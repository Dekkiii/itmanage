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

router.post('/editinfo', [
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
  .withMessage('Address should not contain numbers or special characters')
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
  const { infoId, lastname, firstname, middlename, address, city, region, country, zipcode, birthdate, gender, civil_status, hobby } = req.body;
  const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.render('Addinfo', { errors: errors.array(), errorMessages }); // Pass the errors and an empty array of users to the template
  }
  
  const affineKey = {
    a: 5,
    b: 8 
  };

  try {
    
    const encryptedLastName = affineCipher(lastname, affineKey);
    const encryptedFirstName = affineCipher(firstname, affineKey);
    const zipcodeInt = parseInt(zipcode, 10);
    const birthdateDate = new Date(birthdate);

    await prisma.Student_Info.update({
      where: {
        id: infoId,
      },
      data: {
        lastname,
        firstname,
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
      },
    });

    res.render('home');
    console.log(infoId,lastname,firstname,middlename,address,city,region,country,zipcode,birthdate,gender,civil_status,hobby);
  } catch (err) {
    console.log(err);
  console.log(infoId,lastname,firstname,middlename,address,city,region,country,zipcode,birthdate,gender,civil_status,hobby);
}
});
  

router.post('/admineditinfo', [
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
  .withMessage('Address should not contain numbers or special characters')
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
  const { infoId, lastname, firstname, middlename, address, city, region, country, zipcode, birthdate, gender, civil_status, hobby } = req.body;
  const errors = validationResult(req);
  console.log(infoId, lastname, firstname);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    console.log(errorMessages, errors);
    return res.render('Update', { errorMessages }); // Pass the errors and an empty array of users to the template
   
  }
  
  const affineKey = {
    a: 5,
    b: 8 
  };

  try {
    
    const encryptedLastName = affineCipher(lastname, affineKey);
    const encryptedFirstName = affineCipher(firstname, affineKey);
    const zipcodeInt = parseInt(zipcode, 10);
    const birthdateDate = new Date(birthdate);

    await prisma.Student_Info.update({
      where: {
        id: infoId,
      },
      data: {
        lastname,
        firstname,
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
      },
    });

    res.render('home');
    console.log(infoId,lastname,firstname,middlename,address,city,region,country,zipcode,birthdate,gender,civil_status,hobby);
  } catch (err) {
    console.log(err);
  console.log(infoId,lastname,firstname,middlename,address,city,region,country,zipcode,birthdate,gender,civil_status,hobby);
}
});
  module.exports = router;