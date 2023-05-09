const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const session = require('express-session');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

router.post('/deleteinfo', async (req, res) =>{
  
    const { deleteinfo } = req.body;
    console.log(deleteinfo);
  
    try {
      await prisma.student_Info.delete({
        where: {
          id: deleteinfo,
        },
      });
      res.redirect(`/homepage`)
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
    
  });

module.exports = router;