const express = require('express');
const app = express();
const path = require("node:path")
const fs = require("fs")
const requestIp = require('request-ip');
const cookieParser = require('cookie-parser')
const cors = require("cors");

// IMPORT ROUTES
const authRoutes = require('../routes/users/auth.routes');
const userRoutes = require('../routes/users/user.routes');
const dummyRoutes = require('../routes/dummy/dummy.routes');
// IMPORT ROUTES END



app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/uploads',express.static(path.join(process.cwd(), 'uploads')));

app.use(cookieParser());
app.use(requestIp.mw());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
    ],
    credentials: true, // needed for cookies/auth sessions
  })
);



app.get("/debug", (req, res) => {
  res.json({
    cwd: process.cwd(),
    dirname: __dirname,
  });
});



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dummy', dummyRoutes);






module.exports = app;