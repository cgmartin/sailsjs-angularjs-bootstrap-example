'use strict';

// TODO: Consider releasing this as a bower package once fleshed out
// bower.json:
// {
//   "name": "angular-sails-io",
//   "version": "0.0.1",
//   "main": "angular-sails.io.js",
//   "dependencies": {
//     "angular-socket-io": "~0.3.0"
//   },
//   "devDependencies": {
//     "angular-mocks": "~1.2.6"
//   }
// }

angular.module('sails.io', ['btford.socket-io'])
  .factory('sailsSocketFactory', function(socketFactory, $http, $timeout, $location, $rootScope, $log) {

    var optionDefaults = {
      url: null,
      eventPrefix: 'sailsSocket:',
      reconnectionAttempts: Infinity,
      reconnectionDelay: function(attempt) {
        var maxDelay = 10000;
        var bo = ((Math.pow(2, attempt) - 1) / 2);
        var delay = 1000 * bo; // 1 sec x backoff amount
        return Math.min(delay, maxDelay);
      }
    };

    /**
     * Wraps emit for REST requests to Sails socket.io server
     */
    function requestAction (url, data, cb, method) {

      var socket = this; // The angular Sails Socket

      var usage = 'Usage:\n socket.' +
        (method || 'request') +
        '( destinationURL, dataToSend, fnToCallWhenComplete )';

      // Remove trailing slashes and spaces
      url = url.replace(/^(.+)\/*\s*$/, '$1');

      // If method is undefined, use 'get'
      method = method || 'get';

      if ( typeof url !== 'string' ) {
        throw new Error('Invalid or missing URL!\n' + usage);
      }

      // Allow data arg to be optional
      if ( typeof data === 'function' ) {
        cb = data;
        data = {};
      }

      // Build to request
      var json = io.JSON.stringify({
        url: url,
        data: data
      });

      // Send the message over the socket
      socket.emit(method, json, function afterEmitted (result) {

        var parsedResult = result;

        if (result && typeof result === 'string') {
          try {
            parsedResult = io.JSON.parse(result);
          } catch (e) {
            $log.warn("Could not parse:", result, e);
            // TODO: Handle errors more effectively
            throw new Error("Server response could not be parsed!\n" + result);
          }
        }

        // TODO: Handle errors more effectively
        if (parsedResult === 404) throw new Error("404: Not found");
        if (parsedResult === 403) throw new Error("403: Forbidden");
        if (parsedResult === 500) throw new Error("500: Server error");

        cb && cb(parsedResult);
      });
    }

    return function sailsSocketFactory (options) {
      options = angular.extend({}, optionDefaults, options);

      // Manually handle the socket.io connection
      var ioSocket = io.connect(options.url, { reconnect: false });
      var sailsSocket = socketFactory({
        ioSocket: ioSocket,
        prefix: options.eventPrefix
      });

      // Extend the angular-socket-io socket with sails utilities
      sailsSocket.ioSocket = ioSocket;
      sailsSocket.request = requestAction;
      sailsSocket.get = function(url, data, cb) {
        return this.request(url, data, cb, 'get');
      };
      sailsSocket.post = function(url, data, cb) {
        return this.request(url, data, cb, 'post');
      };
      sailsSocket.put = function(url, data, cb) {
        return this.request(url, data, cb, 'put');
      };
      sailsSocket['delete'] = function(url, data, cb) {
        return this.request(url, data, cb, 'delete');
      };

      // Custom reconnect logic
      sailsSocket.on('disconnect', function() {
        $log.warn('SailsSocket::disconnected');
        var attempts = 0;
        var retry = function() {
          $timeout(function() {
            // Make http request before socket connect, to ensure auth/session cookie
            $log.info('SailsSocket::retrying... ', attempts);
            $http.get($location.path()).success(function(data, status) {
              ioSocket.socket.connect();
            }).error(function(data, status) {
              if (attempts < options.reconnectionAttempts) {
                retry();
              } else {
                $log.error('SailsSocket::failure');
                // send failure event
                $rootScope.$broadcast(options.eventPrefix + 'failure');
              }
            });
          }, options.reconnectionDelay(attempts++));
        };
        if (attempts < options.reconnectionAttempts) retry();
      });

      return sailsSocket;
    };
  });