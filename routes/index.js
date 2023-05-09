var express = require('express');
var router = express.Router();

const {PrismaClient, Prisma} = require("@prisma/client")
var prisma = new PrismaClient

/* GET home page. */
router.get('/index', async function(req, res, next) {
  var students = await prisma.Student_Info.findMany()

  res.render('index', { title: 'Express', students: students });
});

module.exports = router;
