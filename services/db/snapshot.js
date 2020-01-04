var db = require('./index').getDbHandler();
var aql = require('arangojs').aql; // not needed in arangosh

var Snapshot = db.collection('snapshots');

exports.get = async function (key, user) {
    const params = {
        userId: user._id,
        key
    };

    const query = `
        FOR snapshot IN snapshots
           
        //find project related to snapshot and current user   
        LET project = (
            FOR projects IN OUTBOUND @userId project_relation
            FILTER projects._key == snapshot.projectKey
            RETURN projects
        )    

        LET objs = (
            FOR items IN objects
                FILTER items.snapshotKey == @key
                SORT items.title
                RETURN items
        )  
        
        FILTER snapshot._key == @key
        
        //check if project related to snapshot owned by current user
        FILTER snapshot.projectKey == project[0]._key

        RETURN {
            _key: snapshot._key,
            _id: snapshot._id,
            _rev: snapshot._rev,
            title: snapshot.title,
            createdAt: snapshot.createdAt,
            createdBy: snapshot.createdBy,
            layers: snapshot.layers,
            objects: objs,
            project: project
        }`;

    const result = await db.query(query, params);
    return result.next();
};


