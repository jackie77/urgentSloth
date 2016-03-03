var User = require('./userModel.js');
var Q = require('q');
var passportFacebook = require('./../utils/passport-facebook');
var nodemailer = require('nodemailer');

// Promisify a few mongoose methods with the `q` promise library
var getAllUsers = Q.nbind(User.find, User);
var findUser = Q.nbind(User.findOne, User);
var createUser = Q.nbind(User.create, User);

//creates reusable transporter object using default SMTP transport
var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'alexanderanthony813',
            pass: 'cjshghqvdxnmpsxy'
        }
    });


module.exports = {

  removeEvent: function (req, res) {
    var fbId = req.body.fbId;
    var eventId = req.body.fbId;

    findUser({fbId: fbId})
    .then(function (user) {
      if (user) {
        var eventIndex = user.events.indexOf(eventId);
        user.events.splice(eventIndex,1);
        user.save(function(err) {
          if (err) {
            console.error(err);
          }
        });
      } else {
        console.error('Error finding user');
      }
    });
  },

  getUsers: function (req, res) {
    getAllUsers({})
    .then(function (users) {
      if (users) {
        res.send(users);
      } else {
        console.error('Error finding users');
      }
    });
  },

  getUserFriends: function (req, res) {
    var id = req.params.fbId.slice(1);

    findUser({ fbId: id })
    .then(function (user) {
      return passportFacebook.FBExtension.friendsUsingApp(id, user.accessToken);
    })
    .then(function (friends) {
      return friendArray = friends.map(function (friend) {
        return friend.id;
      });
    })
    .then(function (friendsArray) {
      getAllUsers({'fbId': {$in: friendArray}})
      .then(function (friends) {
        res.send(friends);
      });
    })
    .catch(function (error) {
        console.log('userController: Error retrieving friends');
        res.send(404);
    });
  },
  
  addEventToUsers: function (usersArray, eventId) {
    getAllUsers({'fbId': {$in: usersArray}})
      .then(function(users) {
        users.forEach(function(user) {
          user.events.push(eventId);
          user.save(function(err) {
            if (err) {
              console.error(err);
            }
        });
      });
    });
  },

  createOrFindOne: function (profile) {

    var fbId = profile.id;
    var name = profile.displayName;
    var picture = profile.photos[0].value;
    var accessToken = profile.accessToken;
    var email = profile.emails[0].value;
    var friends = profile._json.friends.data.map(function(friend) {
      return {fbId: friend.id};
    });

      findUser({fbId: fbId})
      .then(function (match) {
        //if there's no match, we want to create a new user 
        if (match === null) {
          var newUser = {
            name: name,
            fbId: fbId,
            picture: picture,
            friends: friends,
            accessToken : accessToken,
            email : email
          };
          createUser(newUser);
        } else {// if user already exists, update user's friends and prof pic in the database
          match.friends = friends;
          match.picture = picture;
          match.accessToken = accessToken;
          match.email = email;
          match.save(function (err) {
              if (err){
                return handleError(err);
              }
            });
        }
      })
      .fail(function (error) {
        console.log('createOrFind user Error',error);
        next(error);
      });
  },

  notifyUser : function(req, res){
    var emailAddresses = req.body.emailAddresses.join(', ');
    var messageText = ['Salutations Valuable Human!', '\n', 'You have been invited to ', req.body.eventName].join('');

    // setup e-mail data 
    var mailOptions = {
      from: 'When & Where <notifications@when&where.com>', // sender address 
      to: emailAddresses, // list of receivers 
      subject: 'You are cordially invited...', // Subject line 
      text: 'messageText', // plaintext body 
      html: messageText // html body 
    };

    transporter.sendMail(mailOptions, function(err, info){
      if(err){
        return console.error(err);
      }
      res.json('Message sent: ' + info.response);
    });
  },

  getUserById : function(req, res){
    var fbId = req.params.fbId.slice(1);
    
    findUser({ fbId : fbId })
    .then(function(foundUser){
      res.json(foundUser);
    })
    .fail(function(err){
      if(err){
        console.error(err);
      }
    });
  }

};
