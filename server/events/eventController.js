var Event = require('./eventModel.js');
    User = require('../users/userModel.js');
    Q = require('q');
    userController = require('../users/userController');

// Promisify a few mongoose methods with the `q` promise library
var findEvent = Q.nbind(Event.findOne, Event);
var createEvent = Q.nbind(Event.create, Event);
var findAllEvents = Q.nbind(Event.find, Event);
var updateEvent = Q.nbind(Event.update, Event);

var findUser = Q.nbind(User.findOne, User);
var getAllUsers = Q.nbind(User.find, User);

var pickWinner = function(choices, category){
  var mostVotes = 0;
  var winner = choices[0][category]; 
  for(var i = 0; i < choices.length; i ++){
    if(choices[i].votes > mostVotes){
      mostVotes = choices[i].votes;
      winner = choices[i][category];
    }
  }
  return winner;
}

var makeEventDecision = function(event){
  var date = pickWinner(event['dates'], 'date');
  var location = pickWinner(event['locations'],'location');
  return {date: date, location: location};
}

var updateEventDecision = function(event) {
  var decision = makeEventDecision(event);
  return updateEvent({_id: event._id}, {decision: decision});
}

module.exports = {

  removeUser: function (req, res) {
    var fbId = req.body.fbId;
    var eventId = req.body.eventId;

    findEvent({_id: eventId})
      .then(function (event) {
        if (event) {
          var userIndex = event.users.indexOf(fbId);
          event.users.splice(userIndex,1);
          event.save(function(err) {
                      if (err) {
                        console.error(err);
                      } 
                    });
        } else {
          console.error('Error finding event');
        }
      });
  },

  allEvents: function (req, res, next) {
    findAllEvents({})
      .then(function (events) {
        res.json(events);
      })
      .fail(function (error) {
        next(error);
      });
  },

  newEvent: function (req, res, next) {
    var event = req.body;

    //store dates as js objects
    event.deadline = new Date(event.deadline);
    event.dates.forEach(function(choice){
      choice.date = new Date(choice.date);
    });

    createEvent(event)
      .then(function (createdEvent) {
        if (createdEvent) {
          userController.addEventToUsers(createdEvent.users, createdEvent._id);
          res.json(createdEvent);
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  userEvents: function (req, res, next) {
    var fbId = req.params.fbId.slice(1);
    
    findUser({fbId: fbId})
    .then(function (user) {
      if (!user) {
        res.send(404);
      } else {
        var userEvents = user.events;
        return findAllEvents({'_id': {$in: userEvents}})
      }
    })
    .then(function (events) {
      if(!events.length){
        res.json([]); //Send back empty array
      } else {
        var counter = 0;
        events.forEach(function(event,index){
          if ((event.deadline < new Date() || event.users.length === event.usersWhoSubmitted.length) && event.decision === undefined) {
            updateEventDecision(event)
            .then(function (event) {
              var userIds = event.users;
              getAllUsers({'fbId': {$in: userIds}})
              .then(function(users){
                event.users = users;
                counter++;
                if(counter === events.length){
                  res.json(events);
                }
              });
            })
          } else {
            var userIds = event.users;
            getAllUsers({'fbId': {$in: userIds}})
            .then(function(users){
              event.users = users;
              counter++;
              if(counter === events.length){
                res.json(events);
              }
            });
          }
        });
      }
    })
    .fail(function (error) {
      next(error);
    });
  },

  submitEventVotes: function(req, res, next){
    var eventId = req.body.eventId;
    var userFbId = req.body.userFbId;
    var locationVotesArr = req.body.locationVotesArr;
    var dateVotesArr = req.body.dateVotesArr;

    findEvent({_id: eventId})
    .then(function(event){
      if(event){

        //add votes to selected locations
        locationVotesArr.forEach(function(vote, index){
          if(vote){
            event['locations'][index].votes += 1;
          }
        });
        //add votes to selected dates
        dateVotesArr.forEach(function(vote, index){
          if(vote){
            event['dates'][index].votes += 1;
          }
        });

        //add user to list of user's who've submitted
        event.usersWhoSubmitted.push(userFbId);

        //save event
        Event.update({_id: event._id}, {dates: event.dates, locations: event.locations, usersWhoSubmitted: event.usersWhoSubmitted} ,function (err, savedEvent) {
          if (err) {
            next(err);
          } else {
            res.send(savedEvent);
          }
        });
      } else{ //if event isn't found send a 404
        res.send(404);
      }
    });
  }
};
