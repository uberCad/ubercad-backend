router.post('/order', (req, res) => {
  try {
    const user = users.document(req.session.uid);
    const hash = crypto.jwtEncode('orderbestkey', user._key, 'HS256');
    const order = orders.insert({
      createdBy: user._key,
      createdAt: Date.now(),
      contactInformation: req.body.contactInformation,
      order: req.body.order,
      orderObjects: req.body.orderObjects,
      hash
    });

    if (order._key) {
      res.send({
        message: 'Your order is accepted. Thank you.',
        link: `${hostname}order/${order._key}/${hash}`
      });
    }
    else {
      res.send(order);
    }
  }
  catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
  .body(
    {
      contactInformation: joi.object().required().keys({
        addressCity: joi.string().required(),
        addressCountry: joi.string().required(),
        addressStreet: joi.string().required(),
        comment: joi.string().required(),
        company: joi.string().required(),
        emailAddress: joi.string().required(),
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        phoneNumber: joi.string().required(),
        zipCode: joi.string().required()
      }),
      order: joi.array().items(joi.object().required().keys({
        material: joi.object().required(),
        options: joi.object().required().keys({
          checked: joi.boolean().required(),
          color: joi.string().required(),
          laserMarking: joi.boolean().required(),
          length: joi.string().required(),
          orderQty: joi.string().required(),
          type: joi.string().required()
        })
      })).required(),
      orderObjects: joi.array().items(joi.object().required().keys({
        geometries: joi.array().required(),
        materials: joi.array().required(),
        metadata: joi.object().required(),
        object: joi.object().required()
      }))
    },
    ['application/json']
  )
  .response(joi.object().required().keys({
    message: joi.string(),
    link: joi.string()
  }), 'Returns succes message and link to the order.')
  .summary('Process order')
  .description('Process order from client.');

/**
 * GET /order/:orderKey/:hash
 */
router.get('/order/:orderKey/:hash', (req, res) => {
  try {
    // const user = users.document(req.session.uid);
    const key = req.pathParams.orderKey.toString();
    const hash = req.pathParams.hash.toString();
    const order = orders.document(key);
    if (hash === order.hash) {
      res.send(order);
    }
    else {
      res.throw(404, 'You don\'t have permission to access this order');
    }
  }
  catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
  .pathParam('orderKey', joi.string().required(), 'order key.')
  .pathParam('hash', joi.string().required(), 'hash.')
  .response(joi.object().required().keys({
    _rev: joi.string().required(),
    _key: joi.string().required(),
    _id: joi.string().required(),
    hash: joi.string().required(),
    createdBy: joi.string().required(),
    createdAt: joi.string().required(),
    contactInformation: joi.object().required().keys({
      addressCity: joi.string().required(),
      addressCountry: joi.string().required(),
      addressStreet: joi.string().required(),
      comment: joi.string().required(),
      company: joi.string().required(),
      emailAddress: joi.string().required(),
      firstName: joi.string().required(),
      lastName: joi.string().required(),
      phoneNumber: joi.string().required(),
      zipCode: joi.string().required()
    }),
    order: joi.array().items(joi.object().required().keys({
      material: joi.object().required(),
      options: joi.object().required().keys({
        checked: joi.boolean().required(),
        color: joi.string().required(),
        laserMarking: joi.boolean().required(),
        length: joi.string().required(),
        orderQty: joi.string().required(),
        type: joi.string().required()
      })
    })).required(),
    orderObjects: joi.array().items(joi.object().required().keys({
      geometries: joi.array().required(),
      materials: joi.array().required(),
      metadata: joi.object().required(),
      object: joi.object().required()
    }))
  }).required(), 'Returns order object.')
  .summary('Check order by key and hash')
  .description('Returns order data from db.');
