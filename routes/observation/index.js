const router = require('express').Router(),
      path   = require('path')


// TODO: Actually pull a random observation from the samples

router.get('/history', (req, res) => {
  res.render('observation/history')
})

router.get('/evaluate', (req, res) => {
  res.render('observation/evaluate')
})

module.exports = router
