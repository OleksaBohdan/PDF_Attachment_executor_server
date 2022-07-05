const Koa = require('koa');
const Router = require('koa-router');
const pdfjs = require('pdfjs-dist/build/pdf');
const path = require('path');
const fs = require('fs');
const extractXmlFromPdf = require('./extractor');
const config = require('./config');

const app = new Koa();
app.use(require('koa-bodyparser')());
const router = new Router();

router.post('/', async function (ctx, next) {
  console.log('Got request');
  const fileName = ctx.request.headers.filename;

  console.log(fileName);
  const body = [];
  ctx.request.req.on('data', (chunk) => body.push(Buffer.from(chunk)));
  ctx.request.req.on('end', () => {
    fs.writeFileSync(path.join(__dirname, './PDFs/', fileName), Buffer.concat(body));
    extractXmlFromPdf(fileName);
  });

  const xml = fs.readFileSync(path.join(__dirname, './XMLs/', 'tro1.xml'));
  ctx.body = xml;
});

app.use(router.routes());
app.listen(3000, () => {
  console.log('Server started on port ' + config.PORT);
});
