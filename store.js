const { format } = require('date-fns')
const { Octokit } = require('@octokit/rest')

const github = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

async function getAllDatesMarkup () {
}

async function getDateMarkup (date) {
}

async function savePostJSON (message) {
  const description =
    `CHRONOLOG-${format(new Date(message.timestamp), 'yyyy-MM-dd')}`
  const content = {
    files: {
      [message.timestamp]: {
        content: JSON.stringify({
          body: message.body,
          media: message.media
        })
      }
    },
    public: false
  }

  const gists = await github.gists.list()
  const found = gists.data.find(g => g.description === description)
  return found
    ? github.gists.update({ gist_id: found.id, ...content })
    : github.gists.create({ description, ...content })
}

module.exports = {
  getAllDatesMarkup,
  getDateMarkup,
  savePostJSON
}
