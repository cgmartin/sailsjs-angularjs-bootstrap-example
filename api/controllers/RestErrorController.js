/**
 * RestErrorController
 */
module.exports = {

  isWorking: function (req,res) {
    res.json({ result: true });
  },

  throws: function (req,res) {
    // Acts oddly in HTTP mode with req.xhr, does not return JSON
    throw new Error('Application error thrown');
  },

  error: function (req,res,next) {
    // Acts oddly in HTTP mode with req.xhr, does not return JSON
    next(new Error('Application error thrown'));
  },

  unauthorized: function (req,res) {
    // Managed by isAuthorized.js policy
    res.json({ result: true });
  },

  forbidden: function (req,res) {
    // Managed by `false` policy
    res.json({ result: true });
  }
};