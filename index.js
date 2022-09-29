const functions = require('@google-cloud/functions-framework');
const rclone = require("rclone.js").promises;


function formatDate(dateObj) {
  return dateObj.getFullYear().toString() + "年/" +
    (dateObj.getMonth() + 1).toString() + "月/" +
    (dateObj.getMonth() + 1).toString() + "月" + dateObj.getDate().toString() + "日"
}

function parseMoveList(moveList) {
  const entries = moveList.split(/\r?\nn/)
  const movies = Array()
  for (const i of entries) {
    movies.push(i.slice(43).trim())
  }

  return movies
}

async function listDir(dir) {
  console.log("checking " + dir)
  const curMovies = []

  await rclone.lsd("qyd:/" + dir, {
    "max-depth": 1,
    "env": { RCLONE_CONFIG: "rclone.conf" },
  }).then((moviesStr) => {
    const newMovies = parseMoveList(moviesStr.toString())
    for (const i of newMovies) {
      curMovies.push(i)
    }
  }).catch(error => console.error(error.toString()))

  return curMovies
}

(async () => {
  const start = new Date()
  const allMovies = []

  for (let step = 0; step < 7; step++) {
    start.setDate(start.getDate() - 1)
    const dayMovies = await listDir("日更电影/" + formatDate(start))
    for (const movie of dayMovies) {
      allMovies.push(movie)
    }
  }

  console.log(allMovies)
})();