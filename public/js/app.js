angular.module('sampleApp', [
  'ui.bootstrap',
  'ngRoute',
  'ngCookies',
  'appRoutes',
  'CreateCtrl',
  'LogoutCtrl',
  'IndexCtrl',
  'EventsCtrl',
  'UserService',
  'EventService',
])

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