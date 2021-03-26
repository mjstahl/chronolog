const { format } = require('date-fns')
const fetch = require('node-fetch')
const { Octokit } = require('@octokit/rest')

const { createDay, updateDay, updateRoot } = require('./generator')

const github = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

// GET /
async function getRootMarkup () {
  const gists = await github.gists.list()
  const found = gists.data.find(g => g.description === 'CHRONOLOG-ROOT')
  if (found) {
    const response = await fetch(found.files.html.raw_url)
    return await response.text()
  }
}

// GET /:yyyy-MM-dd
async function getDateMarkup (date) {
  const gists = await github.gists.list()
  const description = `CHRONOLOG-${date}`

  const found = gists.data.find(g => g.description === description)
  if (found) {
    const response = await fetch(found.files.html.raw_url)
    return await response.text()
  }
}

// POST /posts
async function savePostJSON (message) {
  const gists = await github.gists.list()

  const formattedDate = format(new Date(message.timestamp), 'yyyy-MM-dd')
  const description = `CHRONOLOG-${formattedDate}`
  const found = gists.data.find(g => g.description === description)

  let day
  if (found) {
    day = await updateDay(found, message)
    await github.gists.update(day)
  } else {
    day = await createDay(description, message)
    await github.gists.create(day)
  }

  const root = gists.data.find(g => g.description === 'CHRONOLOG-ROOT')
  const updated = updateRoot(root, day, message.timestamp)

  return (root)
    ? await github.gists.update(updated)
    : await github.gists.create(updated)
}

module.exports = {
  getDateMarkup,
  getRootMarkup,
  savePostJSON
}
