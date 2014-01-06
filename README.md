# sailsjs-angularjs-bootstrap-example

> A Sails.js, AngularJS, Twitter Bootstrap example application.

**Notes/Current Status** *(as of Jan 5, 2014)*

Contains a very preliminary AngularJS `Todo List` example that uses Sails REST calls through Socket.io.
Be wary, this has been hacked together over a weekend as a Sails.js/AngularJS learning project.
Do not consider this as production-ready code.

I was curious about how the socket.io connection, the comet messages, and auto-subscriptions worked in Sails
(see `TodoController` in `assets/linker/js/app.js`).
The Sails socket.io code was refactored into an Angular service that wraps the `angular-socket-io` factory
(see `assets/linker/js/angular-sails.io.js`). The retry logic may be of interest, since it first sends a `$http.get()`
request to the server for obtaining the security token cookie, otherwise you'll get the `500 error: "handshake error"`
from socket.io's automatic reconnect logic. The Todo app could use better handling during disconnects and
api errors, which is the next thing I'd like to spent time on before moving on to another example.

The Sails.js asset grunt tasks have been reconfigured to allow Twitter Bootstrap and Font Awesome custom compiles
(see `/assets/linker/styles/*.less`).
The grunt `copy` task has also been reconfigured to include other Bower-managed client-side libraries.

## Utilizes...

- [Sails.js v0.9](http://sailsjs.org/)
- [Twitter Bootstrap v3](http://getbootstrap.com/)
- [AngularJS v1.2](http://angularjs.org/)
- [Angular-UI Bootstrap](http://angular-ui.github.io/bootstrap/)
- [Font Awesome](http://fontawesome.io/)
- [Jade Templates](http://jade-lang.com/)
- [Socket.io](http://socket.io/)
- [Node.js](http://nodejs.org/api/)
- [Bower](http://bower.io/)

## Installation

Make sure you have sails and bower installed:
```sh
sudo npm -g install sails bower
```

Run `npm` and `bower` to install all dependencies:
```sh
cd sailsjs-angularjs-bootstrap-example
npm install ; bower install
```

Lift the server:
```sh
sails lift
```

And visit ([http://localhost:1337/](http://localhost:1337)) for a list of examples.

## License

[MIT License](http://cgm.mit-license.org/)  Copyright © 2014 Christopher Martin