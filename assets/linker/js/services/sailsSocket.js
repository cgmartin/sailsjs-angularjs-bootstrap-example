'use strict';

// See: angular-sails.io.js for sailsSocketFactory
app.factory('sailsSocket', function(sailsSocketFactory, $log) {

  var sailsSocket = sailsSocketFactory({ reconnectionAttempts: 10 });

  // Before connecting, you might want to first send a dummy request
  // to the server url in order to retrieve cookies.
  // (See FAQ at bottom of http://sailsjs.org/#!documentation/sockets)
  //
  //  var deferred = $q.defer();
  //  $http.get(sailsSocket.options.url).success(function(data, status) {
  //    deferred.resolve(sailsSocket.connect());
  //  }).error(function(data, status) {
  //    deferred.reject({ data: data, status: status });
  //  });
  //  return deferred.promise;
  //
  //  ...
  //
  //  promise.then(function(sailsSocket) {
  //    sailsSocket.get('/foo', {}, function(res) { ... });
  //  });

  $log.debug('Connecting to Sails.js...');
  return sailsSocket.connect();
});