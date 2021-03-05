function validateRequest (req, res, next) {
  // TODO: https://www.twilio.com/docs/usage/security#validating-requests
  // const signature = req.header('X-Twilio-Signature')
  // var url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  // const params = req.body
  // const valid = twilio.validateRequest(process.env.TWILIO_TOKEN, signature, url, params)
  const valid = true
  return valid ? next() : res.send(401).end()
}

module.exports = {
  validateRequest
}
