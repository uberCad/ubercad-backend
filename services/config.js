require('dotenv').config();

const config = {
    'ARANGO_HOST': process.env.ARANGO_HOST || 'http://127.0.0.1:8529',
    'ARANGO_DB':   process.env.ARANGO_DB || 'cad',
    'ARANGO_USER': process.env.ARANGO_USER || 'cad',
    'ARANGO_PASS': process.env.ARANGO_PASS || '',
    'JWT_SECRET': process.env.JWT_SECRET || 'secret',
    'GOOGLE_CREDENTIALS': JSON.parse(process.env.GOOGLE_CREDENTIALS) || {
        "installed": {
            "client_id":"32532532532-5325432523525235235.apps.googleusercontent.com",
            "project_id":"ubercad",
            "auth_uri":"https://accounts.google.com/o/oauth2/auth",
            "token_uri":"https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
            "client_secret":"gsgfgdf_DFGdfgdfg_DFGfdgdf_dfg",
            "redirect_uris":[
                "urn:ietf:wg:oauth:2.0:oob",
                "http://localhost"
            ]
        }
    },
    'SPREADSHEET_ID': process.env.SPREADSHEET_ID || '54kjh654kj6546j_54jh654kjh654kjh654jg654hjg6',
    'FACEBOOK_APP_ID': process.env.FACEBOOK_APP_ID || '23132112312331221',
    'FACEBOOK_APP_SECRET': process.env.FACEBOOK_APP_SECRET || '2313211231233122secret1',
    'DOMAIN_API': process.env.DOMAIN_API || 'ubercad-api.bitstack.tech',
};

module.exports = config;