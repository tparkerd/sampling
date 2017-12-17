const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')


// TODO: Show all observations
// NOTE: this may not be necessary if I don't first pull a sample batch
//       from the reddit.posts and comments tables. If I choose to pull
//       a random one each time, then this won't be necessary to exist

router.get('/', (req, res) => {
  res.render('observation/list')
})

module.exports = router
