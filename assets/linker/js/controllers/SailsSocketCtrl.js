'use strict';

app.controller('SailsSocketCtrl', function TodoCtrl($scope, $modal, sailsSocket, $log) {

  var socketErrorModal = null;
  function closeSocketErrorModal() {
    if (socketErrorModal) {
      socketErrorModal.close();
      socketErrorModal = null;
    }
  }
  function openSocketErrorModal(message) {
    closeSocketErrorModal();
    socketErrorModal = $modal.open({
      templateUrl: 'errorModalContent.html',
      controller: function ErrorModalCtrl($scope, $modalInstance, error) {
        $scope.error = error;
      },
      backdrop: 'static',
      keyboard: false,
      resolve: {
        error: function () {
          return {
            message: message
          };
        }
      }
    });
  }

  //
  // Listen for Sails/Socket events
  //
  $scope.$on('sailsSocket:connect', function(ev, data) {
    $log.debug('sailsSocket::connected');
    closeSocketErrorModal();
  });

  $scope.$on('sailsSocket:disconnect', function(ev, data) {
    $log.warn('sailsSocket::disconnected');
    openSocketErrorModal('The application has disconnected from the server... Please wait.');
  });

  $scope.$on('sailsSocket:failure', function(ev, data) {
    $log.error('sailsSocket::failure');
    openSocketErrorModal('The application has given up trying to reconnect. Goodbye!');
  });

});

