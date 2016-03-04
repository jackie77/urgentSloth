angular.module('EventService', [])

.factory('Event', ['$http', function($http) {

  function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
      };

  return {
    get : function() {
      return $http({
        method: 'GET',
        url: '/api/events/'
      }).then(function(res){
        return res.data;
      });
    },

    removeUser : function(eventId, fbId) {
      return $http({
        method: 'POST',
        url: '/api/events/removeUser',
        data: { eventId: eventId, fbId: fbId }
      });
    },

    submitEventVotes : function(voteData) {
      return $http.post('/api/events/submit', voteData)
      .then(function (res) {
        return res.data;
      });
    },

    getUserEvents: function(fbId) {
      return $http({
        method: 'GET',
        url: '/api/events/:' + fbId
      }).then(function(res){
         return res.data;
      });
    },

    create : function(eventData) {
      return $http.post('/api/events', eventData);
    },

    delete : function(id) {
      return $http.delete('/api/events/' + id);
    },

    update : function (event) {
      return $http.put('/api/events/' + event._id);
    },

    searchYelp: function(term, location){
      
      var yelpUrl = 'https://api.yelp.com/v2/search?callback=JSON_CALLBACK'; //without callback part, Yelp will only work for one request and return 404 for all others
      var httpMethod = 'GET';

      //Yelp access token:
      var consumerKey = 'gsjk0o7MGSveWE1fl3XDJQ';
      var token = 'uosUcU25he8AlgqM8paqwzj-j4mpkIhl';
      var consumerSecret = 'jENexVIGC2-ho2MPKDCvISyRfPU';
      var tokenSecret = 'myAMTAkatscCizvq2z3cSffp0uc';

      //Required parameters for oauth signature and Yelp API request:
      var parameters = {callback: 'angular.callbacks._0',
                        location: location,
                        oauth_consumer_key: consumerKey,
                        oauth_token: token,
                        oauth_signature_method: "HMAC-SHA1",
                        oauth_timestamp: new Date().getTime(),
                        oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                        term: term,
                        limit: 10
                       };

      //Generate oauth_signature using 3rd party script (included on index.html):
      var oauth_signature = oauthSignature.generate(httpMethod, yelpUrl, parameters, consumerSecret, tokenSecret, { encodeSignature: false});
      parameters['oauth_signature'] = oauth_signature;
      return $http.jsonp(yelpUrl, {params: parameters})
    }
  };       
}]);