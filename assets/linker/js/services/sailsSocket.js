'use strict';

// See: angular-sails.io.js for sailsSocketFactory
app.factory('sailsSocket', function(sailsSocketFactory, $log) {
  $log.debug('Connecting to Sails.js...');
  return sailsSocketFactory({ reconnectionAttempts: 10 });
});