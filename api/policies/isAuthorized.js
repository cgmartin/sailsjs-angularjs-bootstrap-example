module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  var authorized = false;
  if (req.session.authenticated && authorized) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  if (req.session.authenticated) {
    return res.forbidden('You are not permitted to perform this action.');
  } else {
    // Explicitly handle the 401 Unauthorized case...
    var response = { status: 401, message: 'You must authenticate first' };
    if (req.wantsJSON) {
      return res.send(response, 401);
    } else {
      return res.send(response.message, 401);
    }
  }
};
