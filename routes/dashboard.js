const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();
const session = require('express-session');
app.use(express.json());




router.get('/dashboard', async (req, res) => {
  const userId = session.userId;

  if (!userId) {
    res.redirect('/loginpage');
    
  }else{
    try {
      const userType = user.usertype;
  
  const maleCount = await prisma.Student_Info.count({ where: { gender: "male" } });
  const femaleCount = await prisma.Student_Info.count({ where: { gender: "female" } });
  const singleCount = await prisma.Student_Info.count({ where: { civil_status: "single" } });
  const marriedCount = await prisma.Student_Info.count({ where: { civil_status: "married" } });
  const divorcedCount = await prisma.Student_Info.count({ where: { civil_status: "divorced" } });
  const widowedCount = await prisma.Student_Info.count({ where: { civil_status: "widowed" } });
  const userCount = await prisma.Student_Info.count({ where: { usertype: "user" } });
const managerCount = await prisma.Student_Info.count({ where: { usertype: "manager" } });
const adminCount = await prisma.Student_Info.count({ where: { usertype: "admin" } });

  console.log(maleCount,femaleCount);
  const hobbyCounts = {};

  const studentHobbies = await prisma.Student_Info.findMany({
    select: {
      hobby: true,
    }
  });

  studentHobbies.forEach(student => {
    const hobbies = student.hobby.split(',');
    hobbies.forEach(hobby => {
      if (hobby in hobbyCounts) {
        hobbyCounts[hobby]++;
      } else {
        hobbyCounts[hobby] = 1;
      }
    });
  });

  const hobbyList = Object.entries(hobbyCounts).map(([hobby, count]) => ({ hobby, count }));


  res.render('dashboard', { maleCount, femaleCount,singleCount,marriedCount,divorcedCount,widowedCount, hobbyList, userCount, managerCount,adminCount,userType  });
  console.log(maleCount,femaleCount);
}
catch (err) {
  console.log(err);
  res.status(500).send('Internal server error');
}
}
});


module.exports = router;
