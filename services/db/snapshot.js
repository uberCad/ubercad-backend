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

exports.delete = async function(key, user) {
    const params = {
        userKey: user._key,
        key
    };

    const query = `
        FOR snapshot IN snapshots
            FILTER snapshot.createdBy == @userKey
            FILTER snapshot._key == @key
            REMOVE snapshot IN snapshots
        
        FOR items IN objects
            FILTER items.createdBy == @userKey
            FILTER items.snapshotKey == @key
        REMOVE items IN objects
        
        `;

    const result = await db.query(query, params);
    return result.next();
};

exports.rename = async function (key, title, user) {
    const params = {
        key,
        title,
        userKey: user._key,
    };

    const query = `
        FOR snapshot IN snapshots
            FILTER snapshot._key == @key
            FILTER snapshot.createdBy == @userKey
            UPDATE snapshot WITH { title: @title } IN snapshots
          RETURN NEW`;

    const result = await db.query(query, params);
    return result.next();
};

exports.add = async function (projectKey, user, snapshot, objects) {
    const params = {
        userId: user._key,
        projectKey,
        snapshotTitle: snapshot.title,
        createdAt: Date.now(),
        layers: snapshot.layers,
    };

    if (objects && objects.length) {
        params.objects = [];
    }

    const query = `
    LET exist = (
        FOR s IN snapshots
        FILTER s.projectKey == @projectKey
        FILTER s.createdBy == @userId
        FILTER s.title == @snapshotTitle
        RETURN s._key
    )
    FILTER LENGTH(exist) < 1
    
    LET snapshot = (
        INSERT {
            title: @snapshotTitle,
            createdBy: @userId,
            projectKey: @projectKey,
            createdAt: @createdAt,
            layers: @layers
        } IN snapshots
        RETURN NEW
    )

    LET objectList = [${
        objects.map((object, idx) => {
            params.objects.push({
                title: object.title,
                parameters: object.parameters
            });

            return `{
                title: @objects[${idx}].title,
                createdBy: @userId,
                snapshotKey: snapshot[0]._key,
                projectKey: @projectKey,
                createdAt: @createdAt,
                parameters: @objects[${idx}].parameters
            }`;
        }).join(',\n')
    }]
    
    FOR object IN objectList INSERT object INTO objects

    RETURN {
        _key: snapshot[0]._key,
        title: snapshot[0].title
    }`;

    const result = await db.query(query, params);
    return result.next();
};


