angular.module('EventsCtrl', [])

.controller('EventsController', function($scope, $cookies, Event, User,$route) {

  $scope.showNoEventsMessage = false;
  $scope.noEventsMessage = 'You have no scheduled events. Time to create one?'
  $scope.data = {};
  //Filter array (0=excl/1=excl)
  //Index meaning: [needs your vote, submitted, decided, maxValue in array]
  //Events will only be shown on the page if value at event index === maxValue
  $scope.filters = [0,0,0,0];

  $scope.filterEvents = function(index){
    $scope.filters[index] = !$scope.filters[index]*1;
    $scope.filters[3] = Math.max(1 * $scope.filters[0],1*$scope.filters[1],1*$scope.filters[2]);
  };

  var getUserEvents = function(){
    var userFbId = $cookies.get('fbId');

    Event.getUserEvents(userFbId)
    .then(function (events) {
      
      //Events page only includes future events
      $scope.data.decidedEvents = events.filter(function(event){
        var isFutureEvent = new Date(event.deadline) > Date.now();
        var isVoted = event.usersWhoSubmitted.length === event.users.length;
        return (event.decision || isVoted) && isFutureEvent;
      });

      $scope.data.submittedEvents = events.filter(function(event){
        var isFutureEvent = new Date(event.deadline) > Date.now();
        var isNotVoted = event.usersWhoSubmitted.length !== event.users.length;
        return event.usersWhoSubmitted.indexOf(userFbId) !== -1 && (!event.decision || isFutureEvent) && isNotVoted;
      });

      $scope.data.notVotedEvents = events.filter(function(event){
        var isNotVoted = event.usersWhoSubmitted.length !== event.users.length;
        return event.usersWhoSubmitted.indexOf(userFbId) == -1 && !event.decision && isNotVoted;
      });

      $scope.data.notVotedEvents.map(function(event){
        event.currentIndex = 0;
      });

      if(!$scope.data.decidedEvents.length && !$scope.data.submittedEvents.length && !$scope.data.notVotedEvents.length){
        $scope.showNoEventsMessage = true;
      } else {
        $scope.showNoEventsMessage = false;
      };

      //Past events page only includes past events
      $scope.data.pastEvents = events.filter(function(event){
        return event.decision && new Date(event.decision.date) < Date.now();
      });
      $scope.data.pastEvents.sort(function(a,b){
        return new Date(b.decision.date) - new Date(a.decision.date);
      });
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  //we want to get the user's events when the controller first loads
  getUserEvents();

  $scope.locationVote = function (index, eventIndex, event) {
    if($scope.data.notVotedEvents[eventIndex].locationVotesArr === undefined){
      var length = event.locations.length;
      $scope.data.notVotedEvents[eventIndex].locationVotesArr = Array.apply(null, Array(length)).map(Boolean.prototype.valueOf, false);
    }
    $scope.data.notVotedEvents[eventIndex].locationVotesArr[index] = !$scope.data.notVotedEvents[eventIndex].locationVotesArr[index];
  };

  $scope.dateVote = function (index, eventIndex, event) {
    if($scope.data.notVotedEvents[eventIndex].dateVotesArr === undefined){
      var length = event.dates.length;
      $scope.data.notVotedEvents[eventIndex].dateVotesArr = Array.apply(null, Array(length)).map(Boolean.prototype.valueOf, false);
    }
    $scope.data.notVotedEvents[eventIndex].dateVotesArr[index] = !$scope.data.notVotedEvents[eventIndex].dateVotesArr[index];
  };
  
  //submits decision
  $scope.submit = function (event, index) {
    dateVotesArr = $scope.data.notVotedEvents[index].dateVotesArr;
    locationVotesArr = $scope.data.notVotedEvents[index].locationVotesArr;
    
    //if there are no votes in either vote arrays, show error messages
    if(dateVotesArr === undefined || dateVotesArr.indexOf(true) === -1){
      $scope.showDateTimeMessage = true;
    } else{
      $scope.showDateTimeMessage = false;
    }
    if(locationVotesArr === undefined || locationVotesArr.indexOf(true) === -1){
      $scope.showLocationMessage = true;
    } else{
      $scope.showLocationMessage = false;
    }

    if( dateVotesArr && locationVotesArr && dateVotesArr.indexOf(true) > -1 && locationVotesArr.indexOf(true) > -1){
      var voteData = {
        userFbId: $cookies.get('fbId'), 
        eventId: event._id,
        dateVotesArr: dateVotesArr, 
        locationVotesArr: locationVotesArr 
      };

      Event.submitEventVotes(voteData)
      .then(function (data) {
        $route.reload();
      })
      .catch(function (error) {
        console.error(error);
      });
    }
  };

  $scope.declineEvent = function(event){
    var fbId =  $cookies.get('fbId');

    // remove eventid from the user's events
    User.removeEvent(fbId, event._id);
    //remove userid from the event's users
    Event.removeUser(event._id, fbId);

    //reload the page now that event is gone
    window.location.reload();
  };

})
.directive('toggleClass', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        element.toggleClass(attrs.toggleClass);
      });
    }
  };
});

