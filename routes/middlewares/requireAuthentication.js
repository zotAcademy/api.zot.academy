module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  var err = new Error('Unauthorized')
  err.status = 401
  return next(err)
}
