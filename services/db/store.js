const db = require('./index').getDbHandler();
const { aql } = require('arangojs'); // not needed in arangosh

const Material = db.collection('materials');
const Category = db.collection('categories');

exports.getCategories = async function (user, key = '0') {
  const params = {
    key: `${key}`,
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
        
        LET parts = (
            FOR part IN parts
            FILTER part.categoryKey == @key
            
            LET material = DOCUMENT("materials", part.materialKey)
            
            RETURN {
                _key: part._key,
                _id: part._id,
                title: part.title,
                categoryKey: part.categoryKey,
                userKey: part.userKey,
                materialKey: part.materialKey,
                material: material,
                width: part.width,
                height: part.height,               
                createdAt: part.createdAt,
                svgIcon: part.svgIcon
            }
        ) 

    RETURN {
        category: parentCategory,
        subCategories: subCategories,
        parts: parts
    }
    `;

  const result = await db.query(query, params);
  return result.next();
};

exports.getCategoriesAll = async function (user) {
  try {
    const query = `
        FOR category IN categories
        SORT category.parent_key ASC
        RETURN {
            _key: category._key,
            _id: category._id,
            title: category.title,
            parent_key: category.parent_key
        }
    `;
    const result = await db.query(query);
    return result.nextBatch();
  }
  catch (e) {
    console.log(e);
  }
};

exports.add = async function ({
  title, categoryKey, width, height, materialKey, object, svgIcon
}, user) {
  let material,
    category;
  try {
    material = await Material.document(materialKey.toString());
  }
  catch (e) {
    throw 'Material not found';
  }
  try {
    if (categoryKey !== 0) {
      category = await Category.document(categoryKey.toString());
    }
    else {
      category = { _key: '0' };
    }
  }
  catch (e) {
    throw 'Category not found';
  }

  // check if user admin

  const params = {
    title,
    userKey: user._key,
    categoryKey: category._key,
    materialKey: material._key,
    width,
    height,
    object,
    svgIcon
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
                object: @object,
                svgIcon: @svgIcon
            } IN parts
            RETURN NEW
        )
        RETURN part[0]._key`;

  const result = await db.query(query, params);
  return result.next();
};

exports.get = async function (user, key) {
  const params = {
    key: `${key}`
  };

  try {
    const query = `
    
            FOR part IN parts
            FILTER part._key == @key
            
            LET material = DOCUMENT("materials", part.materialKey)
            LET category = DOCUMENT("categories", part.categoryKey)
            
            RETURN {
                _key: part._key,
                _id: part._id,
                title: part.title,
                categoryKey: part.categoryKey,
                category: category,
                userKey: part.userKey,
                materialKey: part.materialKey,
                material: material,
                width: part.width,
                height: part.height,               
                createdAt: part.createdAt,
                object: part.object,
                svgIcon: part.svgIcon
            }
        `;

    const result = await db.query(query, params);
    return result.next();
  }
  catch (e) {
    console.log(e);
  }
};
