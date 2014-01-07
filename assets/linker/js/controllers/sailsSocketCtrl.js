'use strict';

app.controller('SailsSocketCtrl', function TodoCtrl($scope, $modal, sailsSocket) {

  var socketErrorModal = null;
  function closeSocketErrorModal() {
    if (socketErrorModal) {
      socketErrorModal.dismiss();
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
  // NOTE:
  // The `sailsSocket` factory forwards several of socket.io's events
  // to angular's $rootScope. See the `eventForwards` option inside
  // of `angular-sails.io.js` for details.
  //
  $scope.socketReady = false; // Wait for socket to connect

  $scope.$on('sailsSocket:connect', function(ev, data) {
    closeSocketErrorModal();
    $scope.socketReady = true;
  });

  $scope.$on('sailsSocket:disconnect', function(ev, data) {
    openSocketErrorModal('The application cannot reach the server... Please wait.');
    $scope.socketReady = false;
  });

  $scope.$on('sailsSocket:failure', function(ev, data) {
    openSocketErrorModal('The application failed to connect to the server.');
  });

});

