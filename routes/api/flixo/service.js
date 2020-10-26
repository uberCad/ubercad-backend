const request = require('request');

const checkSvg = (id, body) => new Promise((resolve, reject) => {
  request(
    {
      method: 'POST',
      url: 'https://thermevo.de/flixo/post_svg_file_json',
      body: req.body,
      headers: {
        Cookie: '_ga=GA1.2.1559297713.1526561399; _ym_uid=152656139928282416; session_id=1e4aab7960b17db265729320eb6e6b0c9ce9e036; website_lang=en_US; _gid=GA1.2.1665699095.1529597960; _ym_visorc_33983905=w; _ym_isad=1',
        'Content-Type': 'application/json'
      },
      json: true
    },
    (error, response, body) => {
      // Print the Response
      if (error) {
        console.error(error, body, error.message);
        reject(error);
      }
      console.log(body);
      resolve(body);
    }
  );
});

module.exports = {
  checkSvg
};
