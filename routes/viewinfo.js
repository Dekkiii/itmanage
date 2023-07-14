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

router.get('/viewinformation', async (req, res) =>{
  res.setHeader('Cache-Control', 'no-cache');
  const viewinginfo = req.query.viewinfo;
  console.log(viewinginfo)
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
      const filteredStudents = await prisma.Student_Info.findMany({
        where: {
          id: viewinginfo,
        },
      });

      const gymmember = await prisma.gym_member.findMany({
        where: {
          id: viewinginfo,
        },
      });
      console.log(gymmember)
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
      res.render('infoview', {gymmember, userType, userId, errors: [],errorMessages: '',  successMessages: ''  });
    console.log(filteredStudents);
  }catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
}
    
});

router.post('/viewinfobtn',[], async (req, res) => {
    const { viewinfo } = req.body;
    console.log(viewinfo);
    // Perform any necessary operations with the view value
    res.redirect(`/viewinformation?viewinfo=${viewinfo}`);
  });

 // Mount the router on the Express app

module.exports = router;