'use strict';

// See: angular-sails.io.js for sailsSocketFactory
app.factory('sailsSocket', function(sailsSocketFactory, $log) {

  var customOptions = { reconnectionAttempts: 10 };

  $log.debug('Connecting to Sails.js...');
  var sailsSocket = sailsSocketFactory(customOptions);

  // Forward common events to $rootScope
  sailsSocket.forward(['connect', 'message', 'disconnect']);

  return sailsSocket;
});