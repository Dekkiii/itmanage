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

  
router.post('/addmember', [
  check('lastname').isLength({ min: 3}).withMessage('Last name is required')
  .matches(/^[a-zA-Z]*$/)
  .withMessage('Lastname should not contain numbers or special characters')
  .trim(),
  check('firstname').isLength({ min: 3}).withMessage('First name is required').matches(/^[a-zA-Z]*$/)
  .withMessage('Firstname should not contain numbers or special characters')
  .trim(),
  check('birthdate').notEmpty().withMessage('Birthdate is required'),
  check('experience').notEmpty().withMessage('Experience is required'),
  check('gender').notEmpty().withMessage('Gender is required'),
], async (req, res) => {
  const userId = session.userId;
  const user = await prisma.User.findUnique({
    where: {
      id: userId,
    }
  });
  const coaches = await prisma.Coach.findMany();
  const userType = user.usertype;
  // do something with the form data, such as saving it to a database
  const {coach, lastname, firstname, membershipDuration, experience, number, birthdate, gender, } = req.body;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.render('home', {coaches, userType ,userId, errors: errors.array(), errorMessages,});
  }

  // Define the affine cipher key
  
  // Encrypt the first and last name using the affine cipher
 
  try {
    
    const birthdateDate = new Date(birthdate);
    const memberStart = new Date(); // Set member start date as the current date
    
    // Calculate member until date based on the membership duration
    const membershipDurationMonths = parseInt(membershipDuration);
    const memberUntil = new Date();
    memberUntil.setMonth(memberUntil.getMonth() + membershipDurationMonths);
    
    // Convert the number from string to integer
    const numberInt = parseInt(number);
    
    // Calculate the amount based on the membership duration
    let amount = 0;
    if (membershipDurationMonths === 1) {
      amount = 1000;
    } else if (membershipDurationMonths === 3) {
      amount = 2700;
    } else if (membershipDurationMonths === 6) {
      amount = 4800;
    } else if (membershipDurationMonths === 12) {
      amount = 8400;
    }
    
    // Insert the member data into the database
    const newMember = await prisma.gym_member.create({
      data: {
        lastname,
        firstname,
        gender,
        experience,
        number: numberInt,
        birthdate: birthdateDate,
        memberstart: memberStart,
        memberuntil: memberUntil,
      },
    });

    await prisma.studentcoachinfo.create({
      data: {
        memberId: newMember.id,
        coachId: coach,
        experience: newMember.experience,
      },
    });
    
    // Create a transaction record for the membership creation
    await prisma.transaction.create({
      data: {
        memberId: newMember.id,
        action: 'Membership creation',
        date: new Date(),
      },
    });
    
    // Create a sales record for the membership payment
   await prisma.sales.create({
      data: {
        memberId: newMember.id,
        date: new Date(),
        amount,
        type: 'Membership',
      },
    });
    
    // Update the member's salesId with the newly created sales record
   
    
    res.render('home', { coaches, userType, userId, successMessages: 'User Information Added Successfully' });
  } catch (err) {
    console.log(err);
    // Handle error appropriately
  }
});

 
router.post('/daily', [
  check('lastname').isLength({ min: 3}).withMessage('Last name is required')
  .matches(/^[a-zA-Z]*$/)
  .withMessage('Lastname should not contain numbers or special characters')
  .trim(),
  check('firstname').isLength({ min: 3}).withMessage('First name is required').matches(/^[a-zA-Z]*$/)
  .withMessage('Firstname should not contain numbers or special characters')
  .trim(),
  check('gender').notEmpty().withMessage('Gender is required'),
], async (req, res) => {
  const userId = session.userId;
  const user = await prisma.User.findUnique({
    where: {
      id: userId,
    }
  });
  const coaches = await prisma.Coach.findMany();
  const userType = user.usertype;
  // do something with the form data, such as saving it to a database
  const {number, lastname, firstname, gender, } = req.body;
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.render('home', {coaches, userType ,userId, errors: errors.array(), errorMessages,});
  }

  // Define the affine cipher key
  
  // Encrypt the first and last name using the affine cipher
 
  try {
    
    const numberInt = parseInt(number);
    const daily = 80;
    // Insert the member data into the database
    const dailymember = await prisma.daily.create({
      data: {
        lastname,
        firstname,
        gender,
        number: numberInt,
      },
    });


    // Create a transaction record for the membership creation
   await prisma.transaction.create({
      data: {
        memberId: dailymember.id,
        action: 'Daily',
        date: new Date(),
      },
    });
    
    // Create a sales record for the membership payment
   await prisma.sales.create({
      data: {
        memberId: dailymember.id,
        date: new Date(),
        amount: daily,
        type: 'Daily',
      },
    });
    
    // Update the member's salesId with the newly created sales record
   
    
    res.render('home', { coaches, userType, userId, successMessages: 'User Information Added Successfully' });
  } catch (err) {
    console.log(err);
    // Handle error appropriately
  }
});
module.exports = router;
