let db = require('./index').getDbHandler();
let aql = require('arangojs').aql; // not needed in arangosh

let Part = db.collection('parts');
let Material = db.collection('materials');
let Category = db.collection('categories');

exports.getCategories = async function (user, key) {
    const params = {
        key: key+"",
        parent_key: parseInt(key) || 0
    };

    const query = `
       
        LET parentCategory = (
            FOR parentCategory IN categories
            FILTER parentCategory._key == @key
            
            RETURN {
                _key: parentCategory._key,
                _id: parentCategory._id,
                title: parentCategory.title,
                parent_key: parentCategory.parent_key
            }
        )
                
        LET subCategories = (
            FOR category IN categories
            FILTER category.parent_key == @parent_key
            
            RETURN {
                _key: category._key,
                _id: category._id,
                title: category.title,
                parent_key: category.parent_key
            }
        )
        
        
    
    RETURN {
        category: parentCategory,
        subCategories: subCategories,
        parts: [1,2,3]
    }
    `;

    const result = await db.query(query, params);
    return result.next();
};

exports.add = async function({title, categoryKey, width, height, materialKey, object}, user) {
    let material, category;
    try {
        material = await Material.document(materialKey.toString());
    } catch (e) {
        throw "Material not found";
    }
    try {
        category = await Category.document(categoryKey.toString());
    } catch (e) {
        throw "Category not found";
    }

    // check if user admin

    const params = {
        title,
        userKey: user._key,
        categoryKey: category._key,
        materialKey: material._key,
        width,
        height,
        object
    };

    const query = `    
        LET part = (
            INSERT {
                title: @title,
                userKey: @userKey,
                categoryKey: @categoryKey,
                materialKey: @materialKey,
                createdAt: DATE_NOW(),
                width: @width,
                height: @height,
                object: @object
            } IN parts
            RETURN NEW
        )
    
        RETURN part[0]._key`;

    const result = await db.query(query, params);
    return result.next();
};

exports.get = async function(user, key) {
    return await Part.document(key.toString());
};