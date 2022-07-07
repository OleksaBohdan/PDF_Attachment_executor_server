const http = require('http');
const fs = require('fs');
const path = require('path');
const extractXmlFromPdf = require('./extractor');
const config = require('./config');

http
  .createServer((request, response) => {
    console.log('server got request');
    const fileNameWithExt = request.headers.filename;
    const fileName = fileNameWithExt.split('.')[0];
    let body = [];

    request.on('data', (chunk) => {
      body.push(Buffer.from(chunk));
    });
    request.on('end', () => {
      fs.writeFileSync(path.join(__dirname, './PDFs/', `${fileName}.pdf`), Buffer.concat(body));
      extractXmlFromPdf(`${fileName}.pdf`, () => {
        const xml = fs.readFileSync(path.join(__dirname, './XMLs', `${fileName}.xml`));
        response.write(xml);
        response.end();
        fs.unlink(path.join(__dirname, './PDFs', `${fileName}.pdf`), () => {});
        fs.unlink(path.join(__dirname, './XMLs', `${fileName}.xml`), () => {});
      });
    });
  })
  .listen(config.PORT, () => console.log(`listening on port ${config.PORT}`));
