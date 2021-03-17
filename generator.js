const fs = require('fs')

const ejs = require('ejs')
const fetch = require('node-fetch')

async function createDay(date, description, message) {
  const posts = [{
    timestamp: message.timestamp,
    body: message.body,
    media: message.media
  }]
  const content = {
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
  return { description, ...content }
}

async function updateDay(date, found, message) {
  const response = await fetch(found.files['posts'].raw_url)
  const posts = await response.json()
  const updated = [
    ...posts,
    {
      timestamp: message.timestamp,
      body: message.body,
      media: message.media
    }
  ]
  const day = {
    files: {
      posts: {
        content: JSON.stringify(updated)
      },
      html: {
        content: dayHTML({ date, posts: updated })
      }
    },
    public: false
  }

  return {
    gist_id: found.id,
    ...day
  }
}

function updateRoot(root, day, date) {
  // inverse the order of the days posts so that the most recent
  // appears first
  const posts = JSON.parse(day.files.posts.content)
  posts.reverse()
  const updatedDay = {
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
  if (root) {
    return {
      gist_id: root.id,
      ...updatedDay
    }
  } else {
    return {
      description: 'CHRONOLOG-ROOT',
      ...updatedDay
    }
  }
}

const dayTemplate =
  ejs.compile(fs.readFileSync('./templates/day.ejs', 'utf-8'))
// const listTemplate =
//   ejs.compile(fs.readFileSync('./templates/list.ejs', 'utf-8'))

function dayHTML(day) {
  // massage data here
  // we will need to group posts that fall within the time delimiter
  return dayTemplate(day)
}

module.exports = {
  createDay,
  updateDay,
  updateRoot
}
