const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));



router.get('/viewing', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  const userId = session.userId;
  if (!userId) {
    res.redirect('/loginpage');
  } else {
    try {
      
      const user = await prisma.User.findUnique({
        where: {
          id: userId,
        },
      });
      const userType = user.usertype; // assuming that the field for usertype in the User model is called "usertype"
      const allstudents = await prisma.Student_Info.findMany();
      const students = await prisma.Student_Info.findMany({
      where: {
        userId: userId,
      },
      });

const studentVariableName = userType === "admin" ? allstudents : students;

res.render('view', { students, userId, userType, allstudents, studentVariableName, errors: [], errorMessages: '', });

    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  }
});



router.get('/updateinfo', async (req, res) => {
  console.log(session.userId);
  const updateinfo = req.query.updateinfo;
  console.log(updateinfo);
  const userId = session.userId;
  if (!userId) {
    res.redirect('/loginpage');
  } else {
    try {
      const user = await prisma.User.findUnique({
        where: {
          id: userId,
        },
      });
      const allstudents = await prisma.Student_Info.findMany();
      const students = await prisma.Student_Info.findMany({
        where: {
          userId: userId,
        },
      });
      const filteredStudents = await prisma.Student_Info.findMany({
        where: {
          id: updateinfo,
        },
      });
      const userType = user.usertype; // assuming that the field for usertype in the User model is called "usertype"
      const studentVariableName = userType === "admin" ? allstudents : students;
      res.render('Update', { students, userId, userType, allstudents, studentVariableName, filteredStudents, errors: [], errorMessages: '', });
      console.log(updateinfo);
      console.log(filteredStudents);
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  }
}); // You can now use the userId to filter the students array and pass only the data with the same userId to the template

router.post('/updateinfobtn', [], async (req, res) => {
  const { updateinfo } = req.body;
  console.log(updateinfo);
  // Perform any necessary operations with the updateinfo value
  res.redirect(`/updateinfo?updateinfo=${updateinfo}`);
});

  module.exports = router;