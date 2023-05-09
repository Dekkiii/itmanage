var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');

var addInfoRoute = require('./routes/addinfo');
var homeRoute = require('./routes/home');
var loginRoute = require('./routes/login');
var registerRoute = require('./routes/register');
var editRoute = require('./routes/editinfo');
var viewRoute = require('./routes/view');
var deleteRoute = require('./routes/deleteinfo');



var app = express();
app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRoute);
app.use(addInfoRoute);
app.use(homeRoute);
app.use(registerRoute);
app.use(editRoute);
app.use(viewRoute);
app.use(deleteRoute);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error1');
});

module.exports = app;
