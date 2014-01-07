# sailsjs-angularjs-bootstrap-example

> A Sails.js, AngularJS, Twitter Bootstrap example application.

- "Todo List" AngularJS app w/ Sails Socket.io REST
- Twitter Bootstrap / Font Awesome custom compiles
- Cache busting JS/CSS for production

**Notes/Current Status** *(as of Jan 7, 2014)*

Be wary, this repo has been hacked together over a weekend as a Sails.js/AngularJS learning project.
Do not consider it as production-ready code.

The Todo app was written to explore how the socket.io connection, comet messages, and auto-subscriptions
work in Sails (see `assets/linker/js/controllers/todoCtrl.js`).
The Sails socket.io code was refactored into an Angular service (see `assets/linker/js/angular-sails.io.js`).
The custom retry logic first sends a `$http.get()` request to the server for obtaining the security token cookie,
otherwise you can encounter the `500 error: "handshake error"`
(See bottom of [FAQ](http://sailsjs.org/#!documentation/sockets) page).

If you stop the server or cause a network disconnect when on the Todo App page, you should see
some alert modals pop up.
These are managed by SailsSocketCtrl (see `assets/linker/js/controllers/sailsSocketCtrl.js`)
for reuse in other examples.

The Sails.js asset grunt tasks have been reconfigured to allow Twitter Bootstrap and Font Awesome custom compiles
(see `/assets/linker/styles/*.less`).
The grunt `copy` task has also been reconfigured to include other Bower-managed client-side libraries.

The [levid/angular-sails-socketio-mongo-demo](https://github.com/levid/angular-sails-socketio-mongo-demo) repo
may also be of interest for Angular/Sails integration, though it uses Sails v0.8.

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

Ensure that sails and bower are installed:
```sh
sudo npm -g install sails bower
```

Clone this repo:
```sh
git clone https://github.com/cgmartin/sailsjs-angularjs-bootstrap-example.git
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