const router = require('express').Router();
const service = require('./service');
const validator = require('../../middleware/validate');
const validation = require('./validation');

router.post('/check', validator(validation.flixo), (req, res, next) => {
  service
    .checkSvg(req.body)
    .then((data) => res.send(data))
    .catch(next);
});

module.exports = router;
