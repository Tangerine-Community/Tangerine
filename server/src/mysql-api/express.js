var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
const cors = require('cors');

var indexRouter = require('./index');

var app = express();

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

const basicAuth = require('express-basic-auth');

// Basic Authentication Middleware
const authMiddleware = basicAuth({
  users: { [process.env.API_AUTH_USER]: process.env.API_AUTH_PASSWORD },
  challenge: true,
  unauthorizedResponse: (req) => 'Unauthorized'
});

app.use('/', authMiddleware, indexRouter);

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
});

module.exports = app;
