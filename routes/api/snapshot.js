const router = require('express').Router();
const passport = require('passport');
const Snapshot = require('../../services/db/snapshot');
const objectDb = require('../../services/db/object');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/:key', (req, res, next) => {
  Snapshot
    .get(req.key, req.user)
    .then((snapshot) => {
      if (!snapshot) {
        throw new Error('Not found');
      }
      res.json(snapshot);
    })
    .catch(next);
});

router.post('/add/:projectKey', (req, res, next) => {
  Snapshot
    .add(req.params.projectKey, req.user, {
      title: req.body.title,
      createdBy: req.user._key,
      createdAt: Date.now(),
      layers: req.body.layers
    }, req.body.objects)
    .then((snapshot) => {
      if (!snapshot) {
        return res
          .status(400)
          .send({
            msg: 'Snapshot with same title already exists'
          });
      }
      res.json(snapshot);
    })
    .catch(next);
});

router.delete('/:key', (req, res) => {
  Snapshot
    .delete(req.params.key, req.user)
    .then(() => res.json({ msg: 'success' }))
    .catch(() => res
      .status(400)
      .send({ msg: 'Something went wrong' })
    );
});

router.post('/rename', (req, res, next) => {
  Snapshot.rename(req.body.key, req.body.title, req.user)
    .then((snapshot) => res.json(snapshot))
    .catch(next);
});

router.get('/object/:key', (req, res, next) => {
  objectDb
    .get(req.params.key, req.user)
    .then((object) => res.json(object))
    .catch(next);
});

module.exports = router;
