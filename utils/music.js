const koaBody = require('koa-body');
const path = require('path');

const body = koaBody({
  multipart: true,
  encoding: 'gzip',
  formidable: {
    uploadDir: path.join(__dirname, '../public/music'),
    keepExtensions: true,
  }
})

module.exports.body = body