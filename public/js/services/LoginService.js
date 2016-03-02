angular.module('LoginService', [])
.factory('Login', ['$http','ngCookies', function($http, ngCookies) {
  return {
    isUserLoggedIn : function(){
      console.log($cookies.get('name'));
      return $cookies.get('name');
    }
  };       
}]);