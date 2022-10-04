const functions = require('@google-cloud/functions-framework');
const rclone = require("rclone.js").promises;
const sgMail = require('@sendgrid/mail')

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
  var dayMovies = []

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

async function listMovies() {
  const start = new Date()
  const allMovies = new Map()

  for (let step = 0; step < 7; step++) {
    start.setDate(start.getDate() - 1)
    const dateStr = "日更电影/" + formatDate(start)
    allMovies.set(dateStr, await listDir(dateStr))
  }

  var text = "<table>"
  text += "<tr><th>Path</th><th>Movie</th></tr>"
  allMovies.forEach((movies, day) => {
    if (movies.length != 0) {
      movies.forEach(movie => text += `<tr><td>${day}</td><td>${movie}</td></tr>`)
    }
  })
  text += "</table>"

  await send_email(text)
}

exports.movies = listMovies

// (async () => {
//   await listMovies()
// })();