const db = require('./db/index').getDbHandler();
const { aql } = require('arangojs'); // not needed in arangosh

const userDb = require('./db/user');

const materials = db.collection('materials');
const request = require('request');

exports.loadFixtures = function () {
  console.log('load fixtures');

  // create collections
  ['categories', 'parts', 'google_session', 'materials', 'objects', 'orders', 'projects', 'sessions', 'snapshots', 'users', 'edge/project_relation'].forEach((name) => {
    let collection;
    if (name.startsWith('edge')) {
      collection = db.edgeCollection(name.slice(5));
    }
    else {
      collection = db.collection(name);
    }
    collection.create().then(
      () => console.log('Collection created'),
      (err) => console.error('Failed to create collection:', err.message)
    );
  });

  // create test user
  const testuser = {
    username: 'testuser',
    password: 'password',
    type: 'login'
  };
  const user = userDb.addUser(testuser);
  console.log('created test user', testuser);

  // load all materials
  const materialsUrl = 'https://thermevo.de/api/get_material_json';

  request(materialsUrl, {
    url: materialsUrl,
    method: 'POST',
    body: {},
    json: true
  }, (err, res, body) => {
    if (err) {
      return console.log(err);
    }

    const getMaterials = body.result.O.map((material) => ({
      id: material[0],
      name: material[1],
      density: material[2],
      lambda: material[3],
      epsilon: material[4],
      color: material[5],
      state: material[6],
      type: material[7],
      group: material[8]
    }));

    materials.import(getMaterials, { type: 'documents' });
    console.log(`loaded ${getMaterials.length} materials from ${materialsUrl}`);
  });
};
