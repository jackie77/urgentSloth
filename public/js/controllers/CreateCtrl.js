angular.module('CreateCtrl', []).controller('CreateController', function($scope, $log, $cookies, $location, User, Event) {

  $scope.mytime = new Date();

  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
    $scope.newTime = $scope.mytime;
    console.log('new time is ', $scope.newTime);
  };
  // $scope.newTime;
  $scope.changed = function () {
    $log.log('Time changed to: ' + $scope.mytime);
    $scope.newTime = $scope.mytime;
    console.log('new time is ', $scope.newTime);
  };

  // $scope.clear = function() {
  //   $scope.mytime = null;
  // };


  $scope.friends = []; //List of all users
  $scope.attendees = {}; //List of friends added to an event
  $scope.yelpResults = [];
  $scope.locations = {};
  $scope.dateTimes = {};
  $scope.decideByTime = [];

  $scope.lonelyMessage = "...There's nothing quite like sharing a meal with someone you love - yourself...";
  $scope.showLonelyMessage = true;
  $scope.noLocationsMessage = '“When you make a choice, you change the future.” - Deepak Chopra';
  $scope.showNoLocationsMessage = true;
  $scope.showValidationMessage = false;
  $scope.dateTimeMessage = "Please enter a future date"
  $scope.decideByMessage = "Please enter a future date that is before the earliest date and time option"
  $scope.showDateTimeMessage = false;
  $scope.showDecideByMessage = false;
  $scope.showSpiffy = false;

  //Toggle for Hide/Show Yelp results button
  $scope.toggle = true;
  
  var getFriends = function(){
    User.getFriends($cookies.get('fbId')).then(function(friends){
      $scope.friends = friends;
    });
  };

  getFriends();

  $scope.addFriend = function(friend){
    $scope.showLonelyMessage = false;
    $scope.attendees[friend.fbId] = friend;
  };

  $scope.removeFriend = function(friend){
    delete $scope.attendees[friend.fbId];
    $scope.showLonelyMessage = Object.keys($scope.attendees).length === 0 ? true : false;
  };

  //Fires up Yelp search for restaurants based on 'Add location' form on create.html
  $scope.submit = function() {
    if ($scope.term && $scope.location) {
      $scope.showSpiffy = true;
      Event.searchYelp($scope.term, $scope.location).then(function(results){
        $scope.showSpiffy = false;
        $scope.yelpResults = results.data.businesses;
      }).catch(function(err){
        console.log(err);
      })
    }
  };

  $scope.addRemoveLocation = function(restaurant){
    //Create a unique for the locations object
    var uniqueKey = restaurant.location.coordinate.latitude + '-' + restaurant.location.coordinate.longitude;
    if($scope.locations[uniqueKey]){
      delete $scope.locations[uniqueKey];  
    } else {
      $scope.locations[uniqueKey] = restaurant;
    }  
    $scope.showNoLocationsMessage = Object.keys($scope.locations).length === 0 ? true : false;
  };

  $scope.addDateTimes = function(){
    // $scope.mytime.setFullYear(1970);
    console.log('scope.mytime  at line 103', $scope.mytime);
    // $scope.mytime.setMonth(0);
    // $scope.mytime.setDate(1);
    var dateTime = new Date(1*$scope.date + 1*$scope.mytime-8*3600*1000);

    // console.log($scope.time, 'input time');
    // console.log(dateTime, 'current time');

    if(dateTime < Date.now()){
      $scope.showDateTimeMessage = true;
      return;
    } else {
      $scope.showDateTimeMessage = false;
    }

    // console.log($scope.time, 'scope time');
    // console.log($scope.mytime, 'mytime');
    // console.log(dateTime, 'before');

    $scope.dateTimes[dateTime] = dateTime;
  };

  $scope.removeDateTime = function(dateTime){
    delete $scope.dateTimes[dateTime];
  };

  $scope.addDecideByTime = function(){
    console.log('inside addDecideByTime');
          console.log($scope.decideTime, 'time old!!!');
    //console.log($scope.decideDate, 'date !!!')
    //console.log($scope.decideTime * 1000);
    
    console.log($scope.mytime, 'time new !!!');

    //Allow only one decideBy time
    if(!$scope.decideByTime.length){

      var decideBy = new Date(1*$scope.decideDate + 1*$scope.decideTime-8*3600*1000);
      console.log(decideBy);
      var minDateAndTime = Math.min.apply(null, Object.keys($scope.dateTimes).map(function(key){
        return 1*$scope.dateTimes[key]
      }));
      if(decideBy < Date.now() || decideBy > minDateAndTime){
        $scope.showDecideByMessage = true;
        return;
      } else {
        $scope.showDecideByMessage = false;
      }
      $scope.decideByTime.push(decideBy);
      console.log(decideBy);
    }
  };

  $scope.removeDecideBy = function(){
    $scope.decideByTime.pop();
    console.log($scope.decideByTime, 'decideByTime');
  };

  $scope.submitEvent = function(){
    var eventValidation = {};
    //Check if event name is present
    if(!$scope.eventName){
      eventValidation.eventMessage = 'Please enter an event name'
    };

    //Check if attendees have been added to the event
    if(!Object.keys($scope.attendees).length){
      eventValidation.attendeeMessage = 'Invite some friends to the party'
    };

    //Check if location options are specified
    if(!Object.keys($scope.locations).length){
      eventValidation.locationsMessage = 'Give your friends options by specifying possible locations'
    };

    //Check if dates and times options are specified
    if(!Object.keys($scope.dateTimes).length){
      eventValidation.timeMessage = 'Tell your friends when to show by adding some Date and Time options'
    };
    
    //Check if Decide By date is specified
    if(!$scope.decideByTime.length){
      eventValidation.deadlineMessage = 'Let your friends know when you expect their response by specifying the decide-by date'
    };

    //Check if any of the above failed
    var errArr = Object.keys(eventValidation);
    if(errArr.length){
      $scope.validationMessage = errArr.map(function(key){
        return eventValidation[key] 
      }).join('\n');

      $scope.showValidationMessage = true;
      return;
    };

    $scope.showValidationMessage = false;
    var event = {};
    event.name = $scope.eventName;
    event.deadline = $scope.decideByTime[0];
    //Add locations from locations object
    event.locations = [];
    Object.keys($scope.locations).forEach(function(key){
      event.locations.push({location: $scope.locations[key], votes: 0});
    });
    //Add dates and times from dateTime object
    event.dates = [];
    Object.keys($scope.dateTimes).forEach(function(key){
      event.dates.push({date:$scope.dateTimes[key], votes: 0});
    });
    //Add attendee fbId's from attendees object
    event.users = [];
    Object.keys($scope.attendees).forEach(function(fbId){
      event.users.push(fbId);
    });

    //Add logged in user
    event.users.push($cookies.get('fbId'));

    Event.create(event).then(function(){
      $location.path("/events");
    })
  };
})