const fs = require('fs')

const differenceInMinutes = require('date-fns/differenceInMinutes')
const format = require('date-fns/format')
const fetch = require('node-fetch')
const handlebars = require('handlebars')

require('./templates/helpers')
const { TIME_DELIM } = require('./constants')

async function createDay (date, description, message) {
  const posts = [{
    timestamp: message.timestamp,
    body: message.body,
    media: message.media
  }]
  return {
    description,
    ...assembleDayContent(date, posts)
  }
}

async function updateDay (date, found, message) {
  const response = await fetch(found.files.posts.raw_url)
  const posts = await response.json()
  const updated = [
    ...posts,
    {
      timestamp: message.timestamp,
      body: message.body,
      media: message.media
    }
  ]
  return {
    gist_id: found.id,
    ...assembleDayContent(date, updated)
  }
}

function updateRoot (root, day, date) {
  // inverse the order of the days posts so that the most recent
  // appears first
  const posts = JSON.parse(day.files.posts.content)
  posts.reverse()

  return {
    [root ? 'gist_id' : 'description']: (root) ? root.id : 'CHRONOLOG-ROOT',
    ...assembleDayContent(date, posts)
  }
}

function assembleDayContent (date, posts) {
  return {
    files: {
      posts: {
        content: JSON.stringify(posts)
      },
      html: {
        content: dayHTML({ date, posts })
      }
    },
    public: false
  }
}

const dayTemplate =
  handlebars.compile(fs.readFileSync('./templates/day.handlebars', 'utf-8'))

function dayHTML ({ date, posts }) {
  const sections = posts.reduce((content, post) => {
    const postTimestamp = new Date(post.timestamp)
    const value = (post.body) ? {
      type: 'text',
      value: post.body
    } : {
      type: 'media',
      value: post.media
    }

    const recent = content[content.length - 1]

    // we need to use abs because the root is time
    // reversed, latest -> earliest, where as normal
    // posts are earliest -> latest
    let group = recent
      && Math.abs(differenceInMinutes(new Date(recent.timestamp), postTimestamp)) <= TIME_DELIM
    if (group) {
      recent.content.push(value)
    } else {
      const time = format(postTimestamp, 'h:mm a')
      content.push({
        timestamp: postTimestamp,
        time: time,
        content: [value]
      })
    }
    return content
  }, [])

  const year = date.split('-')[0]
  return dayTemplate({ year, date, sections })
}

module.exports = {
  createDay,
  updateDay,
  updateRoot
}
