const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const twilio = require('twilio')(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
)

const store = require('./store')

const app = express(feathers())
app.use(express.urlencoded({ extended: false }));

app.post('/posts', function createPost({ body }, res) {
  const message = {
    body: body.Body,
    from: body.From.slice(1),
    media: [],
    timestamp: new Date().getTime(),
  }
  if (body.MediaUrl0) {
    let found = true, index = 0
    do {
      message.media.push({
        url: body[`MediaUrl${index}`],
        type: body[`MediaContentType${index}`]
      })
      index += 1
      found = !!body[`MediaUrl${index}`]
    } while (found)
  }
  store.saveMessage(message)
  res.writeHead(201).end()
})

app.use(express.errorHandler())
app.listen(process.env.PORT).on('listening', () => (
  console.log(`Listening on port ${process.env.PORT}`)
))