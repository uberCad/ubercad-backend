const router = require('express').Router();
const service = require('./service');
// const validate = require('../middleware/validate-middleware')
// const validator = require('./validator')

router.post('/check', (req, res, next) => {
  console.log(req.body);
  service
    .checkSvg(req.body)
    .then((data) => res.send(data))
    .catch(next);
});

module.exports = router;
