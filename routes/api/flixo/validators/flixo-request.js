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
          type: 'string',
          required: true
        },
        material_list: {
          type: 'string',
          required: true
        },
        svg_w_h: {
          type: 'string',
          required: true
        },
        token: {
          type: 'string',
          required: true
        },
        svg: {
          type: 'string',
          required: true
        }
      }
    }
  },
  required: ['id', 'jsonrpc', 'method', 'params'],
  additionalProperties: false
};

const validate = ajv.compile(schema);

module.exports = validate;
