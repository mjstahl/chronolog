const twilio = require('twilio')

function validateRequest (req, res, next) {
  let valid = false

  // "+19155543303" -> "19155543303"
  if (req.body.From.slice(1) === process.env.FROM) {
    // https://www.twilio.com/docs/usage/security#validating-requests
    const signature = req.header('X-Twilio-Signature')
    const url = (process.env.ENV === 'production')
      ? `${req.protocol}://${req.get('host')}${req.originalUrl}`
      : `${req.get('X-Forwarded-Proto')}://${req.get('X-Original-Host')}${req.originalUrl}`
    valid = twilio.validateRequest(process.env.TWILIO_TOKEN, signature, url, req.body)
  }
  return valid ? next() : res.sendStatus(401).end()
}

module.exports = {
  validateRequest
}
