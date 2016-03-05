var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var PassportFacebookExtension = require('passport-facebook-extension');
//need to include this to add user to db
var userController = require('./../users/userController');

// configuration ===========================================

// Passport Facebook strategy configuration=================

// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.

passport.use(new Strategy({
  clientID: process.env.FACEBOOK_APP_ID || '610127835807227',
  clientSecret: process.env.FACEBOOK_SECRET || 'a53563712db216f49051299ee9fda4eb',
  callbackURL: '/login/facebook/return',
  profileFields: ['id', 'displayName', 'picture.height(150).width(150)','friends', 'emails']
},
function(accessToken, refreshToken, profile, cb) {

  //call a function which checks if user is in db
  profile.accessToken = accessToken;
  userController.createOrFindOne(profile);
  return cb(null, profile);
}));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

exports.passportFacebook = function (app) {
  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());
}

exports.FBExtension = new PassportFacebookExtension('610127835807227', 'a53563712db216f49051299ee9fda4eb');