var db = require('./index').getDbHandler();
var aql = require('arangojs').aql; // not needed in arangosh

var Project = db.collection('projects');

exports.list = async function (user, filter = 'active') {
    const params = {
        userId: user._id,
    };

    let filterString = '';
    if (filter !== 'all') {
        filterString = 'FILTER projects.status == @filter';
        params.filter = filter
    }

    const query = `
    FOR projects IN ANY @userId project_relation
    OPTIONS { bfs: true, uniqueVertices: 'global' }
    ${filterString}
    RETURN {_key: projects._key,
        _id: projects._id,
        _rev: projects._rev,
        title: projects.title,
        fileName: projects.fileName,
        createdAt: projects.createdAt,
        status: projects.status
    }`;

    const result = await db.query(query, params);
    return result.nextBatch();
};

exports.get = async function (key, user) {
    const params = {
        userId: user._id,
        key
    };

    const query = `
    FOR project IN OUTBOUND @userId project_relation
    FILTER project._key == @key
            
        LET snaps = (   FOR snapshot IN snapshots
                        FILTER snapshot.projectKey == @key AND !snapshot.deleted
                        SORT snapshot.createdAt
                        
                        LET objs = (
                            FOR items IN objects
                                FILTER items.snapshotKey == snapshot._key
                            RETURN {
                                _key: items._key,
                                title: items.title,
                                createdBy: items.createdBy,
                                createdAt: items.createdAt
                            }
                        )   
                      
                        RETURN {
                            _key: snapshot._key,
                            _id: snapshot._id,
                            _rev: snapshot._rev,
                            title: snapshot.title,
                            createdAt: snapshot.createdAt,
                            createdBy: snapshot.createdBy,
                            objects: objs
                        }
                    ) 
        RETURN {
            _key: project._key,
            _id: project._id,
            _rev: project._rev,
            title: project.title,
            fileName: project.fileName,
            createdAt: project.createdAt,
            status: project.status,
            snapshots: snaps   
        }`;

    const result = await db.query(query, params);
    return result.nextBatch();
};


