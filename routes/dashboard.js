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
      
      const user = await prisma.User.findUnique({
        where: {
          id: userId,
        },
      });
      const userType = user.usertype;
  
  const maleCount = await prisma.gym_member.count({ where: { gender: "male" } });
  const femaleCount = await prisma.gym_member.count({ where: { gender: "female" } });
  const beginnerCount = await prisma.gym_member.count({ where: { experience: "Beginner" } });
  const intermediateCount = await prisma.gym_member.count({ where: { experience: "Intermediate" } });
  const expertCount = await prisma.gym_member.count({ where: { experience: "Expert" } });
  const widowedCount = await prisma.Student_Info.count({ where: { civil_status: "widowed" } });
  const userCount = await prisma.Student_Info.count({ where: { usertype: "user" } });
const managerCount = await prisma.Student_Info.count({ where: { usertype: "manager" } });
const adminCount = await prisma.Student_Info.count({ where: { usertype: "admin" } });
const accountcount = await prisma.gym_member.count();
const transactions = await prisma.Transaction.findMany();
const lancebegin = await prisma.Studentcoachinfo.count({ where: { coachId: "64a95334d57e6cb35c77f829", experience:"Beginner" } });
const lanceint = await prisma.Studentcoachinfo.count({ where: { coachId: "64a95334d57e6cb35c77f829", experience:"Intermediate" } });
const lanceexp = await prisma.Studentcoachinfo.count({ where: { coachId: "64a95334d57e6cb35c77f829", experience:"Expert" } });
const vincentbegin = await prisma.Studentcoachinfo.count({ where: { coachId: "64a95353d57e6cb35c77f82a", experience:"Beginner" } });
const vincentint = await prisma.Studentcoachinfo.count({ where: { coachId: "64a95353d57e6cb35c77f82a", experience:"Intermediate" } });
const vincentexp = await prisma.Studentcoachinfo.count({ where: { coachId: "64a95353d57e6cb35c77f82a", experience:"Expert" } });
const elenbegin = await prisma.Studentcoachinfo.count({ where: { coachId: "64a9536bd57e6cb35c77f82b", experience:"Beginner" } });
const elenint = await prisma.Studentcoachinfo.count({ where: { coachId: "64a9536bd57e6cb35c77f82b", experience:"Intermediate" } });
const elenexp = await prisma.Studentcoachinfo.count({ where: { coachId: "64a9536bd57e6cb35c77f82b", experience:"Expert" } });
const mon1 = await prisma.sales.count({ where: { amount: 1000 } });
const mon3 = await prisma.sales.count({ where: { amount: 2700 } });
const mon6 = await prisma.sales.count({ where: { amount: 4800 } });
const mon12 = await prisma.sales.count({ where: { amount: 8400 } });

const sales = await prisma.sales.findMany();


// Calculate the total sales amount
let totalSalesAmount = 0;
const commissionRate = 0.05;

for (const sale of sales) {
  totalSalesAmount += sale.amount;
}

const commission = totalSalesAmount * commissionRate;

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


  res.render('dashboard', {mon1,mon3,mon6,mon12,elenexp,elenint,elenbegin,vincentexp,vincentint,vincentbegin,lanceexp,lanceint,lancebegin, commission, transactions, totalSalesAmount,accountcount, maleCount, femaleCount,beginnerCount,intermediateCount,expertCount,widowedCount, hobbyList, userCount, managerCount,adminCount,userType  });
  console.log(elenexp,elenint,elenbegin,vincentexp);
}
catch (err) {
  console.log(err);
  res.status(500).send('Internal server error');
}
}
});


module.exports = router;
