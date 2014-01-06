'use strict';

app.controller('TodoCtrl', function TodoCtrl($scope, $modal, sailsSocket, $log, filterFilter) {
  $scope.todos = [];
  $scope.newTodo = { title: '', isComplete: false };
  $scope.remainingCount = 0;

  function findIndexByPropertyValue(arr, property, value) {
    var index = null;
    for (var i in arr) {
      if (arr[i][property] == value) {
        index = i;
        break;
      }
    }
    return index;
  }

  var socketErrorModal = null;

  //
  // Listen for Sails/Socket events
  //
  $scope.$on('sailsSocket:connect', function(ev, data) {
    $log.debug('sailsSocket::connected');
    if (socketErrorModal) socketErrorModal.close();

    // Get full collection of todos
    sailsSocket.get(
      '/todo?sort=id%20DESC', {},
      function(response) {
        $scope.todos = response;
        $scope.remainingCount = filterFilter($scope.todos, {isComplete: false}).length;
        $log.debug('sailsSocket::/todo', response);
      });
  });

  $scope.$on('sailsSocket:message', function(ev, data) {
    // ex. {model: "todo", verb: "update", data: Object, id: 3}
    $log.debug('New comet message received :: ', data);

    if (data.model === 'todo') {
      switch(data.verb) {
        case 'create':
          $scope.todos.unshift(data.data);
          break;

        case 'destroy':
          var deleteIndex = findIndexByPropertyValue($scope.todos, 'id', data.id);
          if (deleteIndex !== null)
            $scope.todos.splice(deleteIndex, 1);
          break;

        case 'update':
          var updateIndex = findIndexByPropertyValue($scope.todos, 'id', data.id);
          if (updateIndex !== null) {
            angular.extend($scope.todos[updateIndex], data.data);
          }
          break;
      }
      $scope.remainingCount = filterFilter($scope.todos, {isComplete: false}).length;
    }
  });

  $scope.$on('sailsSocket:disconnect', function(ev, data) {
    $log.warn('Socket.io disconnected');
    $scope.socketError = 'The application has disconnected from the server... Please wait.';
    socketErrorModal = $modal.open({
      templateUrl: 'errorModalContent.html',
      backdrop: 'static',
      keyboard: false,
      scope: $scope
    });
  });
  $scope.$on('sailsSocket:failure', function(ev, data) {
    $log.error('Socket.io total failure');
    $scope.socketError = 'The application has given up trying to reconnect. Goodbye!';
  });

  $scope.openModal = function (todo) {
    var modalInstance = $modal.open({
      templateUrl: 'todoModalContent.html',
      controller: TodoModalCtrl,
      resolve: {
        todo: function () {
          return angular.copy(todo);
        }
      }
    });

    modalInstance.result.then(function (todo) {
      $log.debug('Modal OK:', todo);
      todo.title = todo.title.trim();
      if (todo.id !== undefined) {
        sailsSocket.put('/todo/' + todo.id, todo);
      } else {
        sailsSocket.post('/todo', todo);
      }
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  //
  // Todo Actions
  //
  $scope.toggleCompleted = function(todo) {
    todo.isComplete = !todo.isComplete;
    sailsSocket.put('/todo/' + todo.id, todo);
  };

  $scope.clearCompletedTodos = function () {
    angular.forEach($scope.todos, function (todo) {
      if (todo.isComplete) {
        sailsSocket.delete('/todo/' + todo.id);
      }
    });
  };
});

function TodoModalCtrl($scope, $modalInstance, todo) {

  $scope.todo = todo;

  $scope.ok = function () {
    $modalInstance.close($scope.todo);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}