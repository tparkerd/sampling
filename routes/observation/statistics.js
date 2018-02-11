const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')

router.get('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)

  let query = `SELECT c.*,
                      u.alias
               FROM classifier.classifications c
               INNER JOIN classifier.users u
                ON c.user_id = u.id
               `
  connection.query(query, (err, rows) => {
    if (err) {
      req.flash('error', err)
      return res.render('index')
    }

    let data = {
      users: {
        names: new Set(),
        samples: [],
        counts: []
      },
      samples: {
        absent: [],
        mild: [],
        moderate: [],
        severe: [],
      },
      sampleCounts: []
    }
    // Got data back
    if (rows.length) {
      for (let i in rows) {
        data.users.names.add(rows[i].alias)
        switch (rows[i].rating) {
          case 0:
            data.samples.absent.push(rows[i])
            break
          case 1:
            data.samples.mild.push(rows[i])
            break
          case 2:
            data.samples.moderate.push(rows[i])
            break
          case 3:
            data.samples.severe.push(rows[i])
            break
          default:
            break
        }
      }
      for (let i in rows) {
        // Collect the classified samples under each user
        if (data.users.samples[rows[i].user_id] === undefined)
          data.users.samples[rows[i].user_id] = []
        data.users.samples[rows[i].user_id].push(rows[i])
      }
    }

    // Count the number of samples in each class
    for (let i in Object.keys(data.samples)) {
      data.sampleCounts[i] = data.samples[Object.keys(data.samples)[i]].length
    }

    console.log(data);

    // Count the number of samples evaluted by each user
    for (let i in data.users.samples) {
      data.users.counts[i - 1] = data.users.samples[i].length
    }

    // Convert names of users to an array of strings to be used as labels
    let tmp = Array.from(data.users.names) // convert set of users to an array
    data.users.names = Array.prototype.map.call(tmp, (user) => { return '\'' + user + '\'' })
    return res.render('observation/statistics', { data: data })
  })
})


module.exports = router