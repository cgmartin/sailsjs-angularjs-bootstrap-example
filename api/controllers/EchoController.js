/**
 * EchoController
 */
module.exports = {

  /**
   * Simply responds back with message received
   */
  index: function (req,res) {
    // Get the value of a parameter
    var param = req.param('message');

    // Send a JSON response
    res.json({
      message: param
    });
  }
};