var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');

// var db = require('./app/config');
// var Users = require('./app/collections/users');
// var User = require('./app/models/user');
// var Links = require('./app/collections/links');
// var Link = require('./app/models/link');
// var Click = require('./app/models/click');

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser('va09%7$$8WAv79'));
  app.use(express.session({cookie: {maxAge: 6000000}}));
});

// Handle main page functionality
app.get('/', util.checkUser, function(req, res) {
  res.render('index');
});

app.get('/create', util.checkUser, function(req, res) {
  res.render('index');
});

// Handle logout requests
app.get('/logout', util.logOutUser);

// Handle login page - get and posts
app.get('/login', function(req, res) {
  res.render('login', {loginCase: req.query.loginCase});
});

app.post('/login', util.login);

// Handle sign up page - get and posts
app.get('/signup', function(req, res) {
  res.render('signup', {taken: req.query.taken});
});

app.post('/signup', util.signUpUser);

// Handle link page and link shorten requests
app.get('/links', util.getLinksList);

app.post('/links', util.createShortLink);

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', util.handleWildcard);

console.log('Shortly is listening on 4568');
app.listen(4568);
