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

  //
  // Listen for Sails/Socket events
  //
  $scope.$on('sailsSocket:connect', function(ev, data) {
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
    // Example messages:
    //   {model: "todo", verb: "create", data: Object, id: 25}
    //   {model: "todo", verb: "update", data: Object, id: 3}
    //   {model: "todo", verb: "destroy", id: 20}
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

  //
  // Edit / New Todo modal
  //
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

    modalInstance.result.then(function (result) {
      var todo = result.todo;
      if (result.action == 'delete') {
        sailsSocket.delete('/todo/' + todo.id);
      } else {
        todo.title = todo.title.trim();
        if (todo.id !== undefined) {
          sailsSocket.put('/todo/' + todo.id, todo);
        } else {
          sailsSocket.post('/todo', todo);
        }
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

  $scope.ok = function (action) {
    $modalInstance.close({ action: action, todo: $scope.todo });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}