angular.module('sampleApp', [
  'ui.bootstrap',
  'anchorSmoothScrollService',
  'ngRoute',
  'ngCookies',
  'appRoutes',
  'CreateCtrl',
  'LogoutCtrl',
  'IndexCtrl',
  'EventsCtrl',
  'UserService',
  'EventService'
])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $routeProvider

    // events page
    .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'IndexController'
    })

    // create page
    .when('/create', {
        templateUrl: 'views/create.html',
        controller: 'CreateController'
    })

    // event page 
    .when('/events', {
        templateUrl: 'views/events.html',
        controller: 'EventsController'
    })

    // past events page 
    .when('/pastEvents', {
        templateUrl: 'views/pastEvents.html',
        controller: 'EventsController'
    })

    //go back to logout page
    .when('/logout', {
        templateUrl: 'views/login.html',
        controller: 'LogoutController'
    })
    
    .otherwise({
      redirectTo: '/events'
    });


  $locationProvider.html5Mode(true);

}])

.factory('Auth', ['$http','$cookies', function($http, $cookies) {
  return {
    isUserLoggedIn : function(){
      return ($cookies.get('name')!== undefined);
    }
  }
}])

.run(function($rootScope, Auth, $location) {
  $rootScope.$on('$routeChangeStart', function () {
    if (!Auth.isUserLoggedIn()) {
      $location.path('/login');
    }
  });
});