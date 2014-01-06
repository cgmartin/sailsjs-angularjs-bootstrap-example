'use strict';

app.controller('TodoCtrl', function TodoCtrl($scope, $modal, sailsSocket, $log) {
  $scope.newTodo = { title: '', isComplete: false };

  var getTodoList = function() {
    sailsSocket.get(
      '/todo?sort=id%20DESC', {},
      function(response) {
        $scope.todos = response;
        $log.debug('sailsSocket::/todo', response);
      });
  };

  $scope.$on('sailsSocket:connect', function(ev, data) {
    $log.debug('sailsSocket::connected');
    getTodoList();
  });

  $scope.$on('sailsSocket:message', function(ev, data) {
    // ex. {model: "todo", verb: "update", data: Object, id: 3}
    $log.debug('New comet message received :: ', data);
    if (data.model === 'todo') {
      getTodoList(); // TODO optimize by applying updates using verb instead of re-retrieving all
    }
  });

  $scope.$on('sailsSocket:failure', function(ev, data) {
    $log.error('Socket.io total failure');
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
      if (todo.id !== undefined) {
        sailsSocket.put('/todo/' + todo.id, todo);
      } else {
        sailsSocket.post('/todo', todo);
      }
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleCompleted = function(todo) {
    todo.isComplete = !todo.isComplete;
    sailsSocket.put('/todo/' + todo.id, todo);
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