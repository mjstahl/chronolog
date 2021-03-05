const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

const { validateRequest } = require('./middleware')
const store = require('./store')

const app = express(feathers())
app.disable('x-powered-by')

app.use(express.errorHandler())
app.use(express.urlencoded({ extended: false }))

app.post('/posts', validateRequest, ({ body }, res) => {
  const post = {
    body: body.Body,
    from: body.From.slice(1),
    media: [],
    timestamp: new Date().getTime()
  }
  if (body.MediaUrl0) {
    let found = true
    let index = 0
    do {
      post.media.push({
        url: body[`MediaUrl${index}`],
        type: body[`MediaContentType${index}`]
      })
      index += 1
      found = !!body[`MediaUrl${index}`]
    } while (found)
  }
  store.savePostJSON(post)
  // Fail silently, so go ahead and assume success by immediately
  // sending a 201 Created back. These messages aren't necessarily
  // meant to be important.
  res.writeHead(201).end()
})

app.get('/', async function getAllDates (_, res) {
  res.set('Content-Type', 'text/html')
  // store.getAllDatesMarkup()
  //   .then(html => res.send(html))
  //   // Return failure HTML
  //   .error(e => res.status(500).send(e))
  res.writeHead(501).end()
})

app.get('/:date', async function getDate (req, res) {
  res.set('Content-Type', 'text/html')
  // store.getDateMarkup(req.params.date)
  //   .then(html => res.send(html))
  //   // Return failure HTML
  //   .error(e => res.status(500).send(e))
  res.writeHead(501).end()
})

app.listen(process.env.PORT).on('listening', () => (
  console.log(`Listening on port ${process.env.PORT}`)
))
