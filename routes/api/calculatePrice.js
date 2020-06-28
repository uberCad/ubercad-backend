const express = require('express');
const router = express.Router();
const googleAuth = require('../../services/googleAuth');
const config = require('../../services/config');
const {google} = require('googleapis');


router.get('/', function(req, res, next) {
  res.json({
      resp: 'API calculate price',
  });
});


router.get('/code', async function (req, res, next) {
    const auth = await googleAuth.getAuth(req.query.code);
    res.json(auth);
});


router.post('/ru', async function(req, res, next) {
    const eurPerKg = 3.23; //d5
    const c11 = 0.40; // коэф рент, если заказ 1-10000 м
    const c12 = 0.45; // коэф рент, если заказ 10001-30000 м
    const c13 = 0.50; // коэф рент, если заказ 30001-50000 м

    let objects = req.body;
    const price = [];
    for (let object of objects) {
        console.log(object);

        let kgPerM = object.weight; // d6

        let d9 = eurPerKg / 0.57 * kgPerM;

        price.push({
            minOrderQty: "0",
            price10000: d9 / c11,
            price30000: d9 / c12,
            price50000: d9 / c13
        });
    }
    res.send(price);
});

router.post('/eu', async function(req, res, next) {
    try {
        let auth;
        try {
            auth = await googleAuth.getAuth();
        } catch (e) {
            return res.json({
                success: false,
                msg: e
            })
        }
        const sheets = google.sheets({version: 'v4', auth});

        let getPrice = (options) => {
            return new Promise(async (resolve, reject) => {
                let defaultParams = {
                    'result!L2': options.width, //width
                    'result!M2': options.height, //Height
                    'result!N2': options.area, //Area
                    'result!O2': options.type, //Typ
                    // 'result!B2': '/website/image/product.product/35408_2ac58e7/image', //Link to preview
                    'result!C2': '6', //length
                    'result!D2': 'PaStandard', //material
                    'result!E2': 'webCad-test', //?? Order№
                    'result!F2': 'webCad user', //?? Link to a client
                    'result!G2': new Date().toISOString().replace('-', '_').substr(0, 10), // date
                    'result!H2': 0, //number of seats
                    'result!I2': 10000, //order amount
                    'result!J2': 0, //annual contract amount
                    'result!K2': 0, //country
                    'result!P2': 0, //Gluewire
                    'result!Q2': 0, //Protection foil for powder coating
                    'result!R2': 0, //E-low
                    'result!S2': 0, //Soundblasting
                    'result!T2': 0, //Punching
                    // ...params
                };
                let data = [];
                Object.keys(defaultParams).forEach(range => {
                    data.push({
                        range,
                        values: [[
                            defaultParams[range]
                        ]]
                    })
                });

                sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: config.SPREADSHEET_ID,
                    resource: {
                        valueInputOption: "RAW",
                        data,
                    }
                }, (err, result) => {
                    if (err) {
                        // Handle error
                        console.log(err);
                        throw e;
                    } else {
                        sheets.spreadsheets.values.get({
                            spreadsheetId: config.SPREADSHEET_ID,
                            range: `Input!BE5:BK5`,
                        }, (err, responsePrice) => {
                            if (err) {
                                throw err;
                            }
                            resolve({
                                price: responsePrice.data.values[0][0],
                                minOrderQty: responsePrice.data.values[0][6]
                            })
                        });
                    }
                });

            });
        };

        let objects = req.body;
        const price = [];
        for (let option of objects) {
            price.push(await getPrice(option));

        }
        res.send(price);
    } catch (e) {
        res.status(404).send({msg: 'The entry does not exist'});
    }
});

module.exports = router;
