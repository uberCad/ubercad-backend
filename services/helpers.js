exports.dxfFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(dxf|DXF)$/)) {
        req.fileValidationError = 'Only *.dxf files are allowed!';
        return cb(new Error('Only *.dxf files are allowed!'), false);
    }
    cb(null, true);
};