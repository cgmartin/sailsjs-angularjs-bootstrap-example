'use strict';

/*
 * Remixed from:
 *
 *   angular-socket-io v0.3.0
 *   (c) 2014 Brian Ford http://briantford.com
 *   License: MIT
 *
 * ...and...
 *
 *   sails.io.js v0.9.8
 *   (c) 2012-2014 Mike McNeil http://sailsjs.org/
 *   License: MIT
 */

angular.module('sails.io', [])
  .factory('sailsSocketFactory', function($rootScope, $http, $timeout, $location, $log) {

    var optionDefaults = {
      url: $location.path(),
      defaultScope: $rootScope,
      eventPrefix: 'sailsSocket:',
      eventForwards: ['connect', 'message', 'disconnect', 'error'],
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
      var json = angular.toJson({
        url: url,
        data: data
      });

      // Send the message over the socket
      socket.emit(method, json, function afterEmitted (result) {

        var parsedResult = result;

        if (result && typeof result === 'string') {
          try {
            parsedResult = angular.fromJson(result);
          } catch (e) {
            $log.warn("Could not parse:", result, e);
            parsedResult = { error: { message: 'Bad response from server' }};
          }
        }

        cb && cb(parsedResult);
      });
    }

    function asyncAngularify(socket, callback) {
      return callback ? function () {
        var args = arguments;
        $timeout(function () {
          callback.apply(socket, args);
        }, 0);
      } : angular.noop;
    }

    function addSocketListener(eventName, callback) {
      this.ioSocket.on(eventName, asyncAngularify(this.ioSocket, callback));
    }

    function removeSocketListener() {
      return this.ioSocket.removeListener.apply(this.ioSocket, arguments);
    }

    return function sailsSocketFactory (options) {
      var sailsSocket = {
        options:        angular.extend({}, optionDefaults, options),
        ioSocket:       null,
        on:             addSocketListener,
        addListener:    addSocketListener,
        off:            removeSocketListener,
        removeListener: removeSocketListener,

        canReconnect:   true,
        disconnectRetryTimer: null,

        //
        // REST calls
        //
        request: requestAction,
        get: function(url, data, cb) {
          return this.request(url, data, cb, 'get');
        },
        post: function(url, data, cb) {
          return this.request(url, data, cb, 'post');
        },
        put: function(url, data, cb) {
          return this.request(url, data, cb, 'put');
        },
        delete: function(url, data, cb) {
          return this.request(url, data, cb, 'delete');
        },
        emit: function (eventName, data, callback) {
          return this.ioSocket.emit(eventName, data, asyncAngularify(this.ioSocket, callback));
        },

        // when socket.on('someEvent', fn (data) { ... }),
        // call scope.$broadcast('someEvent', data)
        forward: function (events, scope) {
          if (events instanceof Array === false) {
            events = [events];
          }
          if (!scope) {
            scope = this.options.defaultScope;
          }
          angular.forEach(events, function (eventName) {
            var prefixedEvent = this.options.eventPrefix + eventName;
            var forwardBroadcast = asyncAngularify(this.ioSocket, function (data) {
              scope.$broadcast(prefixedEvent, data);
            });
            scope.$on('$destroy', function () {
              this.ioSocket.removeListener(eventName, forwardBroadcast);
            });
            this.ioSocket.on(eventName, forwardBroadcast);
          }, this);
        },

        disconnect: function() {
          this.canReconnect = false;
          $timeout.cancel(this.disconnectRetryTimer);
          this.removeRetryListeners();
          this.ioSocket.disconnect();
        },

        connect: function(options) {
          if (this.ioSocket) this.disconnect();
          angular.extend(this.options, options);

          this.ioSocket = io.connect(this.options.url, { reconnect: false });
          this.forward(this.options.eventForwards);
          this.canReconnect = true;
          this.addRetryListeners();
          return this;
        },

        //
        // Custom retry logic
        //
        addRetryListeners: function() {
          this.on('disconnect', this.onDisconnect);
          this.on('error', this.onError);
          this.on('connect', this.onConnect);
        },

        removeRetryListeners: function() {
          this.off('disconnect', this.onDisconnect);
          this.off('error', this.onError);
          this.off('connect', this.onConnect);
        },

        // *disconnect* occurs after a connection has been made.
        onDisconnect: function() {
          $log.warn('SailsSocket::disconnected');
          var attempts = 0;
          var retry = function() {
            if (!sailsSocket.canReconnect) return;

            sailsSocket.disconnectRetryTimer = $timeout(function() {
              // Make http request before socket connect, to ensure auth/session cookie
              $log.info('SailsSocket::retrying... ', attempts);
              $http.get(sailsSocket.options.url).success(function(data, status) {
                sailsSocket.ioSocket.socket.connect();
              }).error(function(data, status) {
                  if (attempts < sailsSocket.options.reconnectionAttempts) {
                    retry();
                  } else {
                    // send failure event
                    $log.error('SailsSocket::failure');
                    $rootScope.$broadcast(sailsSocket.options.eventPrefix + 'failure');
                  }
                });
            }, sailsSocket.options.reconnectionDelay(attempts++));
          };

          if (attempts < sailsSocket.options.reconnectionAttempts) retry();
        },

        // *error* occurs when the initial connection fails.
        onError: function() {
          $timeout(function() {
            $log.error('SailsSocket::failure');
            $rootScope.$broadcast(sailsSocket.options.eventPrefix + 'failure');
          }, 0);
        },

        onConnect: function() {
          $log.debug('SailsSocket::connected');
        }
      };

      return sailsSocket;
    };
  });
