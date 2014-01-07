'use strict';

app.controller('RestCtrl', function TodoCtrl($scope, $modal, sailsSocket, $http, $log) {

  function responseAlert(httpOrSocket, url, response, status) {
    // NOTE:
    // Socket calls do not return HTTP status in the `status` argument.
    // Though, a `response.status` is returned when the socket experiences an error.
    // When successful, the `response.status` will likely not exist unless you
    // explicitly include it in your controller responses.
    if (!status) {
      status = (response && response.status) ? response.status : 200;
    }

    $log.debug('REST::' + url, status, response);
    var alertType = (status === 200) ? 'success' : 'danger';
    return [{
      msg: response, status: status, type: alertType, httpOrSocket: httpOrSocket, timestamp: new Date()
    }];
  }

  //
  // Echo Test
  //
  $scope.echoTestAlerts = [];
  $scope.echoText = 'Test 1, 2, 3...';
  $scope.closeEchoAlert = function() { $scope.echoTestAlerts = []; };

  $scope.callEcho = function(httpOrSocket) {
    var message = $scope.echoText;

    var processResponse = function(response, status) {
      $scope.echoTestAlerts = responseAlert(httpOrSocket, '/echo', response, status);
    };

    if (httpOrSocket === 'socket') {
      message = 'SOCKET: ' + message;
      //sailsSocket.get('/echo', { message: message}, processResponse);
      sailsSocket.post('/echo', { message: message}, processResponse);
    } else {
      message = 'HTTP: ' + message;
      //$http.get('/echo?message=' + message)
      // .success(processResponse).error(processResponse);
      $http.post('/echo', { message: message})
        .success(processResponse).error(processResponse);
    }
  };

  //
  // Error Tests
  //
  $scope.errorScenarios = [
    {
      key:   'positive',
      title: 'Positive Test',
      url:   '/resterror/isworking',
      method: 'post'
    },
    {
      key:   'unauthorized',
      title: '401 : Unauthorized',
      url:   '/resterror/unauthorized',
      method: 'post'
    },
    {
      key:   'forbidden',
      title: '403 : Forbidden',
      url:   '/resterror/forbidden',
      method: 'post'
    },
    {
      key:   'not-found',
      title: '404 : Not Found',
      url:   '/resterror/not-found',
      method: 'post'
    },
    {
      key:   'throws',
      title: '500 : Internal Server Error',
      url:   '/resterror/throws',
      method: 'post'
    }
  ];
  // Initialize alerts for each scenario
  $scope.errorAlerts = {};
  angular.forEach($scope.errorScenarios, function(scenario) {
    $scope.errorAlerts[scenario.key] = [];
  });
  $scope.closeErrorAlert = function(key) { $scope.errorAlerts[key] = []; };

  $scope.callErrorScenario = function(httpOrSocket, scenario) {
    var processErrorResponse = function(response, status) {
      $scope.errorAlerts[scenario.key] = responseAlert(httpOrSocket, scenario.url, response, status);
    };

    if (httpOrSocket === 'socket') {
      sailsSocket[scenario.method](scenario.url, {}, processErrorResponse);
    } else {
      $http[scenario.method](scenario.url, {})
        .success(processErrorResponse).error(processErrorResponse);
    }
  };
});
