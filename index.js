const functions = require('@google-cloud/functions-framework')
const rclone = require("rclone.js").promises
const sgMail = require('@sendgrid/mail')
const { customsearch } = require('@googleapis/customsearch')
require('dotenv').config()

const Douban = require('./douban/MovieDetail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function formatDate(dateObj) {
  return dateObj.getFullYear().toString() + "年/" +
    (dateObj.getMonth() + 1).toString() + "月/" +
    (dateObj.getMonth() + 1).toString() + "月" + dateObj.getDate().toString() + "日"
}

function parseMoveList(moveList) {
  const entries = moveList.split(/\n/)
  const movieList = []

  for (const i of entries) {
    if (i.trim().length != 0) {
      movieList.push(i.slice(43))
    }
  }

  return movieList
}

async function listDir(dir) {
  console.log("checking " + dir)
  let dayMovies = []

  await rclone.lsd("qyd:/" + dir, {
    "max-depth": 1,
    "env": { RCLONE_CONFIG: "/run/rclone" },
  }).then((moviesStr) => {
    dayMovies = parseMoveList(moviesStr.toString())
  }).catch(error => console.error(error.toString()))

  return dayMovies
}

async function send_email(text) {
  const msg = {
    from: 'unioah@outlook.com',
    to: 'unioah@gmail.com',
    subject: 'New Movie list',
    html: text,
  }

  await sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
    })
    .catch((error) => {
      console.error(error.response.body.errors)
    })
}

async function searchGoogle(movieName) {
  const search = customsearch('v1')
  const params = { cx: '67d974c96f8984b37', q: movieName, auth: process.env.CUSTOM_SEARCH }

  return await search.cse.list(params).catch(console.error)
}

async function searchDouban(movieID) {
  const douban = new Douban()

  return await douban.getMovieData(movieID).catch(console.error)
}

function getDoubanID(google_results) {
  for (const item of google_results) {
    if (item.link.includes('subject')) {
      const movieID = item.formattedUrl.substring(33).replace('/', '')
      return { id: movieID, url: item.formattedUrl }
    }
  }

  return { id: '', url: '' }
}

function getMovieName(orig) {
  let newName = orig
  if (orig.indexOf('.') != -1) {
    const dot = orig.indexOf('.')
    newName = orig.substring(0, dot)
  }

  return newName
}

async function listMovies() {
  const start = new Date()
  let text = "<table>"
  text += "<tr><th>Movie</th><th>Rating</th></tr>"

  for (let step = 0; step < 7; step++) {
    start.setDate(start.getDate() - 1)
    const dateStr = "日更电影/" + formatDate(start)
    const movies = await listDir(dateStr)

    for (let movie of movies) {
      const movieName = getMovieName(movie)
      const { data } = await searchGoogle(movieName)
      let movieID = ''
      let doubanURL = ''

      if ('items' in data) {
        const { id, url } = getDoubanID(data.items)
        movieID = id
        doubanURL = url
      }

      let movieRating = null
      if (movieID != '') {
        const { rating } = await searchDouban(movieID)
        movieRating = rating
      }

      text += `<tr><td><a href="${dateStr}">${movie}</a></td><td><a href="${doubanURL}">${movieRating}</a></td></tr>`
    }
  }

  text += "</table>"

  await send_email(text)
}

exports.movies = listMovies
exports.searchGoogle = searchGoogle
exports.searchDouban = searchDouban

// (async () => {
//   await listMovies()
// })();