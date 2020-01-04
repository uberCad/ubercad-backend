var express = require('express');
var router = express.Router();
var passport = require('passport');
var projectDb = require('../../services/db/project');
const multer = require('multer');
const { dxfFilter } = require('../../services/helpers');

router.use(passport.authenticate('jwt', { session: false}));

router.get('/file/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let file = await projectDb.file(key, user);
        if (!file) {
            throw new Error("Not found");
        }
        res.json(file);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

router.get('/snapshot/:key', async function (req, res) {
    try {
        const { user } = req;
        const { key } = req.params;
        let snapshot = await projectDb.snapshot(key, user);
        if (!snapshot) {
            throw new Error("Not found");
        }
        res.json(snapshot);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

router.post('/add', function (req, res) {
    try {
        const { user } = req;
        const storage = multer.memoryStorage();
        let upload = multer({ storage: storage, fileFilter: dxfFilter }).single('file');

        upload(req, res, async function(err) {
            if (req.fileValidationError) {
                return res.status(403).send({msg: req.fileValidationError});
            } else if (!req.file) {
                return res.status(403).send({msg: 'Please select a drawing to upload'});
            } else if (err) {
                return res.status(403).send({msg: err});
            }

            const { title, fileName } = req.body;
            const projectKey = await projectDb.create(title, fileName, req.file.buffer.toString(), user);
            res.json({_key: projectKey});
        });
    } catch (e) {
        res.status(404).send({msg: e.toString()});
    }
});



module.exports = router;

