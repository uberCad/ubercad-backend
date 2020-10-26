const router = require('express').Router();
const passport = require('passport');
const Project = require('../../services/db/project');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/list/:filter', (req, res, next) => {
  Project
    .list(req.user, req.params.filter)
    .then((projects) => res.json(projects))
    .catch(next);
});

router.get('/:key', (req, res, next) => {
  Project
    .get(req.params.key, req.user)
    .then((project) => {
      if (!project) {
        throw new Error('Not found');
      }
      res.json(project);
    })
    .catch(next);
});

module.exports = router;
