
router.get('/project/:key', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        const result = db._query(aql`
        FOR project IN OUTBOUND ${user._id} ${projectRelation}
            FILTER project._key == ${req.pathParams.key}
            
        LET snaps =( FOR snapshot IN  ${snapshots}
                        FILTER snapshot.projectKey == ${req.pathParams.key} AND !snapshot.deleted
                        SORT snapshot.createdAt
                        
                        LET objs = (
                            FOR items IN  objects
                                FILTER items.snapshotKey == snapshot._key
                            RETURN {
                                _key: items._key,
                                title: items.title,
                                createdBy: items.createdBy,
                                createdAt: items.createdAt
                                }
                        )   
                      
                        RETURN {_key: snapshot._key,
                                _id: snapshot._id,
                                _rev: snapshot._rev,
                                title: snapshot.title,
                                createdAt: snapshot.createdAt,
                                createdBy: snapshot.createdBy,
                                objects: objs
                                }
                      ) 
        RETURN {_key: project._key,
                    _id: project._id,
                    _rev: project._rev,
                    title: project.title,
                    fileName: project.fileName,
                    createdAt: project.createdAt,
                    status: project.status,
                    snapshots: snaps   
                    }
        `);
        res.send(result)
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .pathParam('key', joi.string().required(), 'Key of the project.')
    .response(joi.object().required(), 'Project stored in the collection "projects".')
    .summary('Retrieve an project by key authorized user ')
    .description('Retrieves an project from the "projects" collection by key if user have authorized');


/**
 * POST /project-archive
 */
const projectArchiveBodyModel = {
    key: joi.string().required(),
    status: joi.string().required(),
};
router.post('/project-archive', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        const key = req.body.key;
        const status = req.body.status;

        const result = db._query(aql`
        FOR project IN OUTBOUND ${user._id} ${projectRelation}
            FILTER project._key == ${key}
            UPDATE project WITH { status: ${status} } IN ${projects}
            LET newProject = NEW
            
        LET snaps =( FOR snapshot IN  ${snapshots}
                        FILTER snapshot.projectKey == ${key} AND !snapshot.deleted
                        SORT snapshot.createdAt
                        
                        LET objs = (
                            FOR items IN  objects
                                FILTER items.snapshotKey == snapshot._key
                            RETURN {
                                _key: items._key,
                                title: items.title,
                                createdBy: items.createdBy,
                                createdAt: items.createdAt
                                }
                        )   
                      
                        RETURN {_key: snapshot._key,
                                _id: snapshot._id,
                                _rev: snapshot._rev,
                                title: snapshot.title,
                                createdAt: snapshot.createdAt,
                                createdBy: snapshot.createdBy,
                                objects: objs
                                }
                      ) 
                      
        RETURN {_key: newProject._key,
                    _id: newProject._id,
                    _rev: newProject._rev,
                    title: newProject.title,
                    fileName: newProject.fileName,
                    createdAt: newProject.createdAt,
                    status: newProject.status,
                    snapshots: snaps   
                    }
        `);
        res.send(...result)
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .response(joi.object().required(), 'Returns the updated project stored in the collection.')
    .body(projectArchiveBodyModel, ['application/json'])
    .summary('Change status project.')
    .description('Change status project. Retrieves an project from the "projects" collection by key. User must be authorized.');

/**
 * POST /add-project
 */
const addProjectBodyModel = joi.array().items(joi.object().required()).required();
router.post('/add-project', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        const parts = req.body;
        const file = parts[0].data.toString();
        const title = parts[1].data.toString();
        const fileName = parts[2].data.toString();

        const addProject = db._query(aql`
       LET exist = (FOR p IN OUTBOUND ${user._id} ${projectRelation}
                   FILTER p.title == ${title}
                   RETURN p._key)
       FILTER LENGTH(exist) < 1
       LET project = (INSERT {title: ${title},
                               createdAt: DATE_NOW(),
                               fileName: ${fileName},
                               status: "active",
                               file: ${file}
                               } IN projects
                       RETURN NEW)
       LET relation = (INSERT {_from: ${user._id},
                               _to: project[0]._id,
                               "role": "owner"}
                       IN project_relation
                       RETURN NEW)
                       
       RETURN project[0]._key
       `);

        res.send({_key: addProject._documents[0].toString()})

    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .response(joi.object().required(), 'Returns new project key saved in db.')
    .body(addProjectBodyModel, ['multipart/form-data'])
    .summary('Add new project.')
    .description('Add new project to projects and add project-key to registered user.');

/**
 * GET /project-file/:projectKey
 */
router.get('/project-file/:projectKey', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        const key = req.pathParams.projectKey.toString();
        const result = db._query(aql`
        FOR projects IN OUTBOUND ${user._id} ${projectRelation}
            FILTER projects._key == ${key}
            RETURN projects.file
        `);
        res.send(...result);

    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .response(joi.object().required(), 'Returns project data file.')
    .pathParam('projectKey', joi.string().required(), 'Project key.')
    .summary('Get project DXF file data.')
    .description('Returns project dxf file data.');

/**
 * GET /projects-list/:filter
 */
router.get('/projects-list/:filter', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        const filter = req.pathParams.filter.toString();
        let result;

        if (filter === 'active' || filter === 'archive') {
            result = db._query(aql`
            FOR projects IN OUTBOUND ${user._id} ${projectRelation}
                    FILTER projects.status == ${filter}
                    RETURN {_key: projects._key,
                            _id: projects._id,
                            _rev: projects._rev,
                           title: projects.title,
                           fileName: projects.fileName,
                           createdAt: projects.createdAt,
                           status: projects.status
                           }
            `);
        } else {
            result = db._query(aql`
            FOR projects IN OUTBOUND ${user._id} ${projectRelation}
                    RETURN {_key: projects._key,
                            _id: projects._id,
                            _rev: projects._rev,
                           title: projects.title,
                           fileName: projects.fileName,
                           createdAt: projects.createdAt,
                           status: projects.status
                            }
            `);
        }
        res.send(result)
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .response(joi.array().items(joi.object().required()).required(), 'Returns projects array.')
    .pathParam('filter', joi.string().required(), 'Parameter: active, archive filter projects, else parameter return all user projects')
    .summary('Get project list.')
    .description('Returns users projects list.');

/**
 * POST /add-snapshot/:projectKey
 */
router.post('/add-snapshot/:projectKey', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        let key = req.pathParams.projectKey.toString();

        const snapshot = snapshots.insert({
                title: req.body.title,
                createdBy: user._key,
                projectKey: key,
                createdAt: Date.now(),
                layers: req.body.layers
            }
        );
        req.body.objects.forEach(item => {
                objects.insert({
                        title: item.title,
                        createdBy: user._key,
                        snapshotKey: snapshot._key,
                        projectKey: key,
                        createdAt: Date.now(),
                        parameters: item.parameters
                    }
                )
            }
        );
        const snaps = db._query(aql`
        FOR snapshot IN  ${snapshots}
            FILTER snapshot.projectKey == ${key} AND 
                   !snapshot.deleted AND
                   snapshot._key == ${snapshot._key}
        LET objs = (
            FOR items IN  objects
                FILTER items.snapshotKey == ${snapshot._key}
                RETURN {
                    _key: items._key,
                    title: items.title,
                    createdBy: items.createdBy,
                    createdAt: items.createdAt
                    }
        )                     
        RETURN {_key: snapshot._key,
                _id: snapshot._id,
                _rev: snapshot._rev,
                title: snapshot.title,
                createdAt: snapshot.createdAt,
                createdBy: snapshot.createdBy,
                objects: objs
                }
        `);
        res.send(snaps._documents[0]);
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .response(joi.object().required().keys(
        {
            _key: joi.string().required(),
            _id: joi.string().required(),
            _rev: joi.string().required(),
            title: joi.string().required(),
            createdAt: joi.string().required(),
            createdBy: joi.string().required(),
            objects: joi.array().items(joi.object().optional()).required()
        }
    ).unknown(), 'Return snapshot.')
    .body(
        {
            title: joi.string().required(),
            layers: joi.string().required(),
            objects: joi.array().items(joi.object().optional()).required()
        },
        ['application/json'])
    .pathParam('projectKey', joi.string().required(), 'project key.')
    .summary('Add snapshot to project.')
    .description('Add snapshot to project.');


/**
 * GET /get-snapshots/:projectKey
 */
router.get('/get-snapshots/:projectKey', function (req, res) {
    try {
        const key = req.pathParams.projectKey.toString();
        const result = db._query(aql`
        FOR snapshot IN  ${snapshots}
            FILTER snapshot.projectKey == ${key} AND !snapshot.deleted
                RETURN {_key: snapshot._key,
                        _id: snapshot._id,
                        _rev: snapshot._rev,
                        title: snapshot.title,
                        createdAt: snapshot.createdAt,
                        createdBy: snapshot.createdBy
                        }
        `);
        res.send(result);
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .pathParam('projectKey', joi.string().required(), 'project key.')
    .response(joi.array().items(joi.object().required().keys({
        _key: joi.string().required(),
        _id: joi.string().required(),
        _rev: joi.string().required(),
        title: joi.string().required(),
        createdAt: joi.string().required(),
        createdBy: joi.string().required()
    })).required(), 'Returns snapshots array.')
    .summary('Returns array snapshots.')
    .description('Returns array snapshots data.');

/**
 * GET /snapshot/:snapshotKey
 */
router.get('/snapshot/:snapshotKey', function (req, res) {
    try {
        const key = req.pathParams.snapshotKey.toString();
        const snapshot = db._query(aql`
        FOR snapshot IN  ${snapshots}
            FILTER snapshot._key == ${key}
            
        LET objs = (
            FOR items IN  ${objects}
                FILTER items.snapshotKey == ${key}
                SORT items.title
                RETURN items
        )                         
            
        RETURN {_key: snapshot._key,
                _id: snapshot._id,
                _rev: snapshot._rev,
                title: snapshot.title,
                createdAt: snapshot.createdAt,
                createdBy: snapshot.createdBy,
                layers: snapshot.layers,
                objects: objs
                        }
        `);

        res.send(snapshot._documents[0])
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .pathParam('snapshotKey', joi.string().required(), 'snapshot key.')
    .response(joi.object().required().keys({
        _key: joi.string().required(),
        _id: joi.string().required(),
        _rev: joi.string().required(),
        title: joi.string().required(),
        createdAt: joi.string().required(),
        createdBy: joi.string().required(),
        layers: joi.string().required(),
        objects: joi.array().required()
    }).required(), 'Return snapshot object.')
    .summary('Return snapshot by key.')
    .description('Return snapshot by key.');


/**
 * GET /object-snapshot/:objectKey
 */
router.get('/object-snapshot/:objectKey', function (req, res) {
    try {
        let object = objects.document(req.pathParams.objectKey);
        res.send(object)
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .pathParam('objectKey', joi.string().required(), 'object key.')
    .response(joi.object().required().keys({
        _key: joi.string().required(),
        _id: joi.string().required(),
        _rev: joi.string().required(),
        title: joi.string().required(),
        snapshotKey: joi.string().required(),
        projectKey: joi.string().required(),
        parameters: joi.string().required(),
        createdAt: joi.string().required(),
        createdBy: joi.string().required()
    }).required(), 'Return snapshot object.')
    .summary('Return object snapshot.')
    .description('Return object snapshot from objects collections.');

/**
 * DELETE /del-snapshot/:snapshotKey
 */
router.delete('/snapshot/:snapshotKey', function (req, res) {
    try {
        const key = req.pathParams.snapshotKey.toString();
        const result = db._query(aql`            
            REMOVE { _key: ${key}} IN ${snapshots}
            FOR items IN  ${objects}
                FILTER items.snapshotKey == ${key}
            REMOVE items IN ${objects}
        `);

        result._documents.length === 0 ? res.send({success: 'Success remove snapshot & objects.'}) : res.send(result)
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .pathParam('snapshotKey', joi.string().required(), 'snapshot key.')
    .response(joi.object().required().keys({
        success: joi.object()
    }).required(), 'Return snapshot object.')
    .summary('Delete snapshot.')
    .description('Delete snapshot by key.');

/**
 * GET /get-materials-thermevo
 */
router.get('/get-materials-thermevo', function (req, res) {
    try {
        const response = request(
            {
                method: 'POST',
                url: 'https://thermevo.de/api/get_material_json',
                body: {},
                json: true
            });

        const getmaterials = response.json.result.O.map(material => {
            return {
                id: material[0],
                name: material[1],
                density: material[2],
                lambda: material[3],
                epsilon: material[4],
                color: material[5],
                state: material[6],
                type: material[7],
                group: material[8]
            }
        });

        const result = materials.insert(getmaterials, {returnNew: true});
        res.send(result)

    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .summary('Get materials from thermevo.de')
    .description('Get materials from thermevo.de and save to DB in "materials" collection.');


/**
 * GET /materials
 */
router.get('/materials', function (req, res) {
    try {
        const result = materials.all();
        res.send(result)

    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .response(joi.array().items(joi.object().required().keys({
        _key: joi.string().required(),
        _id: joi.string().required(),
        _rev: joi.string().required(),
        type: joi.string().required(),
        state: joi.string().required(),
        name: joi.string().required(),
        lambda: joi.number().required(),
        id: joi.string().required(),
        group: joi.number().required(),
        epsilon: joi.number().required(),
        density: joi.number().required(),
        color: joi.string().required()
    })).required(), 'Returns materials array.')
    .summary('Get materials from DB')
    .description('Get materials from DB.');

/**
 * POST /calculate
 */
router.post('/calculate', function (req, res) {
    try {
        const authorization = request.get(`${db_hostname}_db/cad/auth/access`).body;

        //"range" for get info how to use: https://developers.google.com/sheets/api/samples/reading
        const priceCells = `Input!BE5:BK5`;
        const urlPriceResult = `https://content-sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${priceCells}?key=${apiKey}`;

        let getPrice = (options) => {
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
            const setCell = request(
                {
                    method: 'POST',
                    url: `https://content-sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate?alt=json&key=${apiKey}`,
                    body: {
                        "valueInputOption": "RAW",
                        "data": data
                    },
                    headers: {
                        'authorization': authorization,
                        'Content-Type': 'application/json',
                        'x-referer': 'https://explorer.apis.google.com'
                    },
                    json: true,
                });

            const responsePrice = request(
                {
                    method: 'GET',
                    url: urlPriceResult,
                    headers: {'authorization': authorization}
                });

            if (!responsePrice.json || !responsePrice.json.values) {
                return ({
                    setCell: setCell.json,
                    getPrice: responsePrice.json
                });
            } else {
                return {
                    price: responsePrice.json.values[0][0],
                    minOrderQty: responsePrice.json.values[0][6]
                }
            }
        };

        let objects = req.body;
        const price = [];
        objects.forEach(option => {
            price.push(getPrice(option));
        });

        res.send(price);

    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .body(joi.array().items(joi.object().required().keys({
        area: joi.number().required(),
        height: joi.number().required(),
        type: joi.number().required(),
        weight: joi.number().required(),
        width: joi.number().required()
    })).required(), ['application/json'])
    .response(joi.array().items(joi.object().required().keys({
        price: joi.string().required(),
        minOrderQty: joi.string().required()
    })).required(), 'Returns array with price, minOrderQty.')
    .summary('Get price, min order')
    .description('Get price, min order for each object.');


/**
 * DELETE /del-snapshot/:snapshotKey
 */
router.delete('/project/:projectKey', function (req, res) {
    try {
        const key = req.pathParams.projectKey.toString();
        projects.remove({_key: key});
        snapshots.removeByExample({projectKey: key});
        projectRelation.removeByExample({_to: `projects/${key}`});

        res.send('Project success removed');
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .pathParam('projectKey', joi.string().required(), 'projectKey key.')
    .summary('Delete project')
    .description('Delete project and all snapshots.');

// ========= get /user picture_url ====================

/**
 * GET /picture-url
 */
router.get('/picture-url', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        res.send(user.picture_url ? user.picture_url : '');
    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .response(joi.string().required(), 'Returns array with price, minOrderQty.')
    .summary('Get user picture-url')
    .description('Get user picture-url from DB.');

/**
 * POST /order
 */
router.post('/order', function (req, res) {
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
            }
        );

        if (order._key) {
            res.send({
                message: `Your order is accepted. Thank you.`,
                link: `${hostname}order/${order._key}/${hash}`
            });
        } else {
            res.send(order);
        }
    } catch (e) {
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
router.get('/order/:orderKey/:hash', function (req, res) {
    try {
        // const user = users.document(req.session.uid);
        const key = req.pathParams.orderKey.toString();
        const hash = req.pathParams.hash.toString();
        const order = orders.document(key);
        if (hash === order.hash) {
            res.send(order);
        } else {
            res.throw(404, `You don't have permission to access this order`);
        }

    } catch (e) {
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


/**
 * POST /project-rename
 */
router.post('/project-rename', function (req, res) {
    try {
        const user = users.document(req.session.uid);
        const key = req.body.key;
        const title = req.body.title;

        // AQL
        const result = db._query(aql`
        FOR project IN OUTBOUND ${user._id} ${projectRelation}
            FILTER project._key == ${key}
            UPDATE project WITH { title: ${title} } IN ${projects}
            LET newProject = NEW
            RETURN newProject.title
        `);
        res.send(...result);

    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .body({
            key: joi.string().required(),
            title: joi.string().required()
        },
        ['application/json']
    )
    .response(joi.string().required(), 'Returns new project title.')
    .summary('Rename project.')
    .description('Rename project.');

/**
 * POST /snapshot-rename
 */
router.post('/snapshot-rename', function (req, res) {
    try {
        const key = req.body.key;
        const title = req.body.title;
        const result = db._query(aql`
        FOR snapshot IN  ${snapshots}
            FILTER snapshot._key == ${key}
            UPDATE snapshot WITH { title: ${title} } IN ${snapshots}
            LET newSnapshot = NEW
        
        LET objs = (FOR items IN  objects
                        FILTER items.snapshotKey == newSnapshot._key
                    RETURN {
                           _key: items._key,
                           title: items.title,
                           createdBy: items.createdBy,
                           createdAt: items.createdAt
                           }
                    )     
            
        RETURN {_key: newSnapshot._key,
                _id: newSnapshot._id,
                _rev: newSnapshot._rev,
                title: newSnapshot.title,
                createdAt: newSnapshot.createdAt,
                createdBy: newSnapshot.createdBy,
                objects: objs
               }   
          `);

        res.send(...result);

    } catch (e) {
        if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
            throw e;
        }
        res.throw(404, 'The entry does not exist', e);
    }
})
    .body({
            key: joi.string().required(),
            title: joi.string().required()
        },
        ['application/json']
    )
    .response(joi.object().required().keys({
        _rev: joi.string().required(),
        _key: joi.string().required(),
        _id: joi.string().required(),
        title: joi.string().required(),
        createdBy: joi.string().required(),
        createdAt: joi.string().required(),
        objects: joi.array().items(joi.object().required().keys({
            createdAt: joi.string().required(),
            createdBy: joi.string().required(),
            title: joi.string().required(),
            _key: joi.string().required()
        }))
    }), 'Return rename snapshot.')
    .summary('Rename snapshot.')
    .description('Rename snapshot.');

