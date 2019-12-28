require('dotenv').config();

const config = {
    'ARANGO_HOST': process.env.ARANGO_HOST || 'http://127.0.0.1:8529',
    'ARANGO_DB':   process.env.ARANGO_DB || 'cad',
    'ARANGO_USER': process.env.ARANGO_USER || 'cad',
    'ARANGO_PASS': process.env.ARANGO_PASS || '',
    'JWT_SECRET': process.env.JWT_SECRET || 'secret',
};


//passport

//jwtConfig










module.exports = config;