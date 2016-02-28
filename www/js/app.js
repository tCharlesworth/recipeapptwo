// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.constant('CONSTANTS', 
    {
        serverUrl: 'http://kitchenfriend.tcharlesworth.com',
        storage: {
            recipes: 'kitchenFriendRecipes'
        }
    }
)

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
    
    $stateProvider
        .state('Landing', {
            url: '/',
            templateUrl: './html/landing.html'
        })
        
        .state('Recipes', {
            url: '/recipes',
            templateUrl: './html/recipes.html',
            controller: 'recipesCtrl'
        })
        
        .state('Recipe', {
            url: '/recipe/:recipeId',
            templateUrl: './html/recipe.html',
            controller: 'recipeCtrl'
        })
        
        .state('Login', {
            url: '/login',
            templateUrl: './html/login.html',
            controller: 'loginCtrl'
        })
        
    $urlRouterProvider.otherwise('/');
})

.controller('loginCtrl', function($scope, $ionicPopup, dataService, $state) {
    
    $scope.localLogin = function(loginInfo) {
        if(!loginInfo || !loginInfo.email || !loginInfo.password) {
            // alert("Username and password required");
            var confirmPopup = $ionicPopup.alert({
                title: 'Login Error',
                template: 'Username and password are required'
            });
            return;
        }
        //TODO
        dataService.tryLocalLogin(loginInfo).then(function(response) {
            //done.
            console.log('login success', response);
            $state.go('Recipes');
        }).catch(function(err) {
            console.error('Login error', err);
            $ionicPopup.alert({
                title: 'Login Error',
                template: 'Email or password are incorrect.'
            });
        });
    };
    
    $scope.googleLogin = function() {
        var ref = window.open('http://google.com');
        ref.addEventListener('loadstart', function(event) { 
            if((event.url).startsWith("http://localhost/callback")) {
                // var requestToken = (event.url).split("code=")[1];
                ref.close();
            }
        });
    };
    
})

.controller('recipesCtrl', function($scope, dataService) {
    $scope.recipes = dataService.getRecipes();
})

.controller('recipeCtrl', function($scope, dataService, $state, $stateParams) {
    var id = $stateParams.recipeId;
    if(id) {
        $scope.recipe = dataService.getRecipeById(id);
        console.log('Found: ', $scope.recipe);
    } else {
        $state.go('Recipes');
    }
})

.directive('appHeader', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@'
        },
        templateUrl: './html/appHeader.html'
    };
})

.directive('recipePreview', function() {
    return {
        restrict: 'E',
        templateUrl: './html/recipePreview.html',
        scope: {
            recipe: '='
        },
        controller: function($scope) {
            $scope.expanded = false;
        }
    };
})

.service('dataService', function($http, CONSTANTS, storageService) {
    var recipes;
    
    this.getRecipes = function() {
        if(!recipes) {
            // look in local storage
            recipes = storageService.loadRecipes();
        }
        return recipes;
    };
    
    this.getRecipeById = function(recipeId) {
        if(!recipes) {
            recipes = storageService.loadRecipes();
        }
        for(var i = 0; i < recipes.length; i++) {
            if(recipes[i]._id === recipeId) {
                return recipes[i];
            }
        }
    }
    
    this.getRecipesFromServer = function() {
        // get the users id
        var userId = '3';
        // go to the server
        return $http({
            method: 'GET',
            url: CONSTANTS.serverUrl + '/mobile/recipes/' + userId
        }).then(function (response) {
            console.log('Got Response From Server: ', response);
            // Save to local storage
            // storageService.saveRecipes(response.data);
            return response;
        });
    };

    this.tryLocalLogin = function (authData) {
        //Need to hit server here
        return $http({
            method: 'POST',
            url: CONSTANTS.serverUrl + '/mobile/login',
            data: authData
        }).then(function (response) {
            //Save Recipes
            storageService.saveRecipes(response.data.recipes);
            return response.data;
        });
    };
})

.service('storageService', function(CONSTANTS) {
    this.saveRecipes = function(recipes) {
        var data = JSON.stringify(recipes);
        localStorage.setItem(CONSTANTS.storage.recipes, data);
    };
    
    this.loadRecipes = function() {
        var data = localStorage.getItem(CONSTANTS.storage.recipes);
        if(data) {
            data = JSON.parse(data);
        }
        return data;
    };
})