const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const session = require('express-session');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

router.get('/homepage', async (req, res) =>{
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
      res.render('home', { students, userId, errors: [],errorMessages: '',  successMessages: ''  });
    console.log(userId);
  }catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
}
    
});


module.exports = router;