const router = require('express').Router();
const passport = require('passport');
const multer = require('multer');

const Project = require('../../services/db/project');
const { dxfFilter } = require('../../services/helpers');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/file/:key', (req, res, next) => {
  Project
    .file(req.params.key, req.user)
    .then((file) => {
      if (!file) {
        throw new Error('Not found');
      }
      res.json(file);
    })
    .catch(next);
});

router.post('/add', (req, res) => {
  try {
    const { user } = req;
    const storage = multer.memoryStorage();
    const upload = multer({ storage, fileFilter: dxfFilter }).single('file');

    upload(req, res, async (err) => {
      if (req.fileValidationError) {
        return res.status(403).send({ msg: req.fileValidationError });
      } if (!req.file) {
        return res.status(403).send({ msg: 'Please select a drawing to upload' });
      } if (err) {
        return res.status(403).send({ msg: err });
      }

      const { title, fileName } = req.body;
      const projectKey = await Project.create(title, fileName, req.file.buffer.toString(), user);
      res.json({ _key: projectKey });
    });
  }
  catch (e) {
    res.status(404).send({ msg: e.toString() });
  }
});

router.post('/archive', (req, res, next) => {
  Project
    .edit(
      req.params.key,
      {
        status: req.params.status
      },
      req.user
    )
    .then((project) => res.json(project))
    .catch(next);
});

router.post('/rename', (req, res, next) => {
  Project
    .edit(
      req.params.key,
      {
        title: req.params.title
      },
      req.user
    )
    .then((project) => res.json(project))
    .catch(next);
});

router.delete('/:key', (req, res, next) => {
  Project
    .remove(req.params.key, req.user)
    .then((project) => res.json(project))
    .catch(next);
});

module.exports = router;
