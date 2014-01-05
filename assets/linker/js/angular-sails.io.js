angular.module('sails.io', ['btford.socket-io'])
  .factory('sailsSocket', function(socketFactory, $http, $timeout, $location, $rootScope, $log) {

    var sailsSocketOptions = {
      maxRetry: 20,
      backoff: function(attempt) {
        var bo = ((Math.pow(2, attempt) - 1) / 2);
        bo = (bo < 60) ? bo : 60;
        return bo;
      }
    };

    var ioSocket = io.connect(null, { reconnect: false });
    var socketOptions = {
      ioSocket: ioSocket,
      prefix: 'sailsSocket:'
    };
    var sailsSocket = socketFactory(socketOptions);

    function request (url, data, cb, method) {

      var socket = this;

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

    sailsSocket.ioSocket = ioSocket;
    sailsSocket.request = request;
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

    // Manually retry by first getting auth/session cookie
    sailsSocket.on('disconnect', function() {
      $log.warn('SailsSocket::disconnected');
      var attempts = 0;
      var retry = function() {
        $log.info('SailsSocket::retrying... ', attempts);
        $timeout(function() {
          $http.get($location.path()).success(function(data, status) {
            ioSocket.socket.connect();
          }).error(function(data, status) {
            if (attempts < sailsSocketOptions.maxRetry) {
              retry();
            } else {
              // send failure event
              $rootScope.$broadcast(socketOptions.prefix + 'failure');
              $log.error('SailsSocket::failure');
            }
          });
        }, 1000 * sailsSocketOptions.backoff(attempts++));
      };
      retry();
    });

    return sailsSocket;
  });