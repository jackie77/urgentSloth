// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

require('./utils/passport-facebook').passportFacebook(app);

//db conncection
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/urgentSloth');

var connection = mongoose.connection;
connection.on('error', function (err) { console.log('db connection err:',err)});

// set our port
var port = process.env.PORT || 3000; 

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/../public')); 
// routes ==================================================
require('./config/routes.js')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:3000
app.listen(port);   

// shoutout to the user                     
console.log('Magic happens on port ' + port);

// expose app           
exports = module.exports = app;                         
