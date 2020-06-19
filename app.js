var express = require('express');
var Cors = require('cors');
//body parser
var logger = require('morgan');
var passport = require('passport');


var createError = require('http-errors');
var path = require('path');
var session = require('express-session');
var sassMiddleware = require('node-sass-middleware');


var config = require('./services/config');
var passportConfig = require('./services/passport');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(Cors());
app.use(logger('dev'));

app.use(session({
    secret: config.JWT_SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());


// app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));

//load fixtures
if (process.argv.includes("load-fixtures")) {
    require('./services/init').loadFixtures();
}

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/api', apiRouter);



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
  res.render('error');
});

module.exports = app;
