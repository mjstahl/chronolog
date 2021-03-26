const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')

require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
const { validateRequest } = require('./middleware')
const store = require('./store')

const app = express(feathers())
app.disable('x-powered-by')

app.use(express.errorHandler())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('assets'))

app.get('/', async function getAllDates (_, res) {
  res.set('Content-Type', 'text/html')
  try {
    const markup = await store.getRootMarkup()
    if (!markup) {
      res.status(404)
    } else {
      res.send(markup)
    }
  } catch (e) {
    res.status(500).send(e)
  }
})

app.get('/:date', async function getDate (req, res) {
  res.set('Content-Type', 'text/html')
  try {
    const markup = await store.getDateMarkup(req.params.date)
    if (!markup) {
      res.status(404)
    } else {
      res.send(markup)
    }
  } catch (e) {
    res.status(500).send(e)
  }
})

app.post('/posts', validateRequest, ({ body }, res) => {
  const post = {
    body: body.Body,
    // "+19155543303" -> "19155543303"
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
  // sending a "201 Created" back. These messages aren't necessarily
  // meant to be important.
  res.writeHead(201).end()
})

app.listen(process.env.PORT).on('listening', () => (
  console.log(`Listening on port ${process.env.PORT}`)
))
