var express = require('express');

var router = express.Router();
var passport = require('passport');
const multer = require('multer');
var projectDb = require('../../services/db/project');
const { dxfFilter } = require('../../services/helpers');

router.use(passport.authenticate('jwt', { session: false }));

router.get('/file/:key', async (req, res) => {
  try {
    const { user } = req;
    const { key } = req.params;
    const file = await projectDb.file(key, user);
    if (!file) {
      throw new Error('Not found');
    }
    res.json(file);
  }
  catch (e) {
    res.status(404).send({ msg: 'The entry does not exist' });
  }
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
      const projectKey = await projectDb.create(title, fileName, req.file.buffer.toString(), user);
      res.json({ _key: projectKey });
    });
  }
  catch (e) {
    res.status(404).send({ msg: e.toString() });
  }
});

router.post('/archive', async (req, res) => {
  try {
    const { user } = req;
    const { key, status } = req.body;

    const project = await projectDb.edit(key, {
      status
    }, user);
    res.json(project);
  }
  catch (e) {
    res.throw(404, 'The entry does not exist', e);
  }
});

router.post('/rename', async (req, res) => {
  try {
    const { user } = req;
    const { key, title } = req.body;

    const project = await projectDb.edit(key, {
      title
    }, user);
    res.json(project);
  }
  catch (e) {
    res.throw(404, 'The entry does not exist', e);
  }
});

router.delete('/:key', async (req, res) => {
  try {
    const { user } = req;
    const { key } = req.params;
    const project = await projectDb.remove(key, user);
    res.json(project);
  }
  catch (e) {
    res.json(e.toString());
  }
});

module.exports = router;
