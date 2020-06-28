let db = require('./index').getDbHandler();
let aql = require('arangojs').aql; // not needed in arangosh

exports.add = async function({createdBy, createdAt, contactInformation, order, orderObjects, hash}, user) {
    const params = {
        createdBy, createdAt, contactInformation, order, orderObjects, hash
    };

    const query = `    
        LET order = (
            INSERT {
                createdBy: @createdBy,
                createdAt: @createdAt, 
                contactInformation: @contactInformation, 
                order: @order, 
                orderObjects: @orderObjects, 
                hash: @hash
            } IN orders
            RETURN NEW
        )
    
        RETURN order[0]._key`;

    const result = await db.query(query, params);
    return result.next();
};

exports.get = async function(user, key, hash) {
    const params = {
        key: key + "",
        hash
    };

    try {
        const query = `

            FOR order IN orders
            FILTER order._key == @key && order.hash == @hash
            RETURN order
        `;

        const result = await db.query(query, params);
        return result.next();
    } catch (e) {
        console.log(e);
    }
};