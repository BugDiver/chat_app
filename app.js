var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

var io = require('socket.io').listen(app.listen(port));
io.set('log level',0);

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());





require('./lib/routes')(app, io ,passport ,Strategy);
