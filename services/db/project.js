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

exports.file = async function (key, user) {
    const params = {
        userId: user._id,
        key
    };

    const query = `
    FOR projects IN OUTBOUND @userId project_relation
        FILTER projects._key == @key
        RETURN projects.file`;

    const result = await db.query(query, params);
    return result.next();
};

exports.snapshot = async function (key, user) {
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

exports.create = async function (title, fileName, file, user) {
    const params = {
        userId: user._id,
        title,
        fileName,
        file
    };

    const query = `
    LET exist = (FOR p IN OUTBOUND @userId project_relation
                 FILTER p.title == @title
                 RETURN p._key)
    FILTER LENGTH(exist) < 1
    LET project = (
        INSERT {
            title: @title,
            createdAt: DATE_NOW(),
            fileName: @fileName,
            status: "active",
            file: @file
        } IN projects
        RETURN NEW
    )
    LET relation = (
        INSERT {
            _from: @userId,
            _to: project[0]._id,
            "role": "owner"
        } IN project_relation
        RETURN NEW
    )

    RETURN project[0]._key`;

    const result = await db.query(query, params);
    return result.next();
};

