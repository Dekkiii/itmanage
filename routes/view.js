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


const affineDecipher = (input, key) => {
  let output = '';
  const aInverse = key.a
  const bInverse = key.b
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    if (c >= 65 && c <= 90) {
      const decryptedChar = (((aInverse * ((c - 65) - bInverse)) % 26) + 26) % 26;
      output += String.fromCharCode(decryptedChar + 65);
    } else if (c >= 97 && c <= 122) {
      const decryptedChar = (((aInverse * ((c - 97) - bInverse)) % 26) + 26) % 26;
      output += String.fromCharCode(decryptedChar + 97);
    } else {
      output += input.charAt(i);
    }
  }
  return output;
}

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
      const adminallstudents = await prisma.Student_Info.findMany();
      console.log(adminallstudents)
      const users = await prisma.User.findMany({
        where: {
          usertype: userType,
        },
      });

      // Get all the ids of the users with the same userType
      const userIds = users.map((u) => u.id);
      console.log(userIds)

      // Get all the Student_Info records with the userIds
      const allstudents = await prisma.Student_Info.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
      });
      console.log(allstudents)
      const affineKey = {
        a: 21,
        b: 8
      };
      

      // Decrypt the first names and last names in adminallstudents
      const decryptedAdminAllStudents = adminallstudents.map(student => {
        const decryptedFirstName = affineDecipher(student.firstname, affineKey);
        const decryptedLastName = affineDecipher(student.lastname, affineKey);
        return {
          ...student,
          firstname: decryptedFirstName,
          lastname: decryptedLastName
        };
      });
      console.log(decryptedAdminAllStudents)
      // Decrypt the first names and last names in allstudents
      const decryptedAllStudents = allstudents.map(student => {
        const decryptedFirstName = affineDecipher(student.firstname, affineKey);
        const decryptedLastName = affineDecipher(student.lastname, affineKey);
        return {
          ...student,
          firstname: decryptedFirstName,
          lastname: decryptedLastName
        };
      });
      const gymmember = await prisma.Gym_member.findMany();
      const studentVariableName = userType === "admin" || userType === "manager" ? decryptedAdminAllStudents: decryptedAllStudents;
      res.render('view', {
        userId,
        userType,gymmember,
        allstudents: decryptedAllStudents,
        adminallstudents:decryptedAdminAllStudents,
        studentVariableName,
        errors: [],
        errorMessages: '',
      });
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
      const affineKey = {
        a: 21,
        b: 8
      };
      const decryptedfilteredStudents = filteredStudents.map(student => {
        const decryptedFirstName = affineDecipher(student.firstname, affineKey);
        const decryptedLastName = affineDecipher(student.lastname, affineKey);
        return {
          ...student,
          firstname: decryptedFirstName,
          lastname: decryptedLastName
        };
      });
      const userType = user.usertype; // assuming that the field for usertype in the User model is called "usertype"
      const studentVariableName = userType === "admin" ? allstudents : students;
      res.render('Update', { students, userId, userType, allstudents, studentVariableName, filteredStudents: decryptedfilteredStudents, errors: [], errorMessages: '', });
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