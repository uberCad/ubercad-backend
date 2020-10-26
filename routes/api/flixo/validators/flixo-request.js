const ajv = require('ajv')();

require('ajv-keywords')(ajv);

const schema = {
  type: 'object',
  properties: {
    id: {
      type: 'number'
    },
    jsonrpc: {
      type: 'string'
    },
    method: {
      type: 'string'
    },
    params: {
      type: 'object',
      properties: {
        frame: {
          type: 'string'
        },
        material_list: {
          type: 'string'
        },
        svg_w_h: {
          type: 'string'
        },
        token: {
          type: 'string'
        },
        svg: {
          type: 'string'
        }
      }
    }
  },
  required: ['id', 'jsonrpc', 'method', 'params', 'params.frame', 'params.material_list', 'params.svg_w_h', 'params.token', 'params.svg'],
  additionalProperties: false
};

const validate = ajv.compile(schema);

module.exports = validate;
