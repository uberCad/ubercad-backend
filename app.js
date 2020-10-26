const express = require('express');
 cors = require('cors');
// body parser
const logger = require('morgan');
const passport = require('passport');

const createError = require('http-errors');
const path = require('path');
const session = require('express-session');
const sassMiddleware = require('node-sass-middleware');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./services/config');
// const passportConfig = require('./services/passport');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(cors());
app.use(logger('dev'));

app.use(session({
  secret: config.JWT_SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
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

// load fixtures
if (process.argv.includes('load-fixtures')) {
  require('./services/init').loadFixtures();
}

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
