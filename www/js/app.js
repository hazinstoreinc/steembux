// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('steembux', ['ionic','ngCordova','monospaced.qrcode' ,'steembux.controllers','steembux.services'])

.run(function($ionicPlatform,$ionicPopup,$state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    $state.go("app.login");
})})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html'
          //,controller: 'AppCtrl'
        }
      }
    })
  .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html'
           //,controller: 'AppCtrl'
        }
      }
    })
    .state('app.payments', {
      url: '/payments',
      views: {
        'menuContent': {
          templateUrl: 'templates/payment.html'
           //,controller: 'AppCtrl'
        }
      }
    })
    .state('app.contacts', {
      url: '/contacts',
      views: {
        'menuContent': {
          templateUrl: 'templates/addressbook.html'
           //,controller: 'AppCtrl'
        }
      }
    })
    .state('app.history', {
      url: '/history',
      views: {
        'menuContent': {
          templateUrl: 'templates/history.html'
           //,controller: 'AppCtrl'
        }
      }
    })
    .state('app.scan', {
      url: '/scan',
      views: {
        'menuContent': {
          templateUrl: 'templates/qrscan.html'
          ,controller : 'QrScanCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/settings');
});
