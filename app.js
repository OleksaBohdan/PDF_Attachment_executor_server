const http = require('http');
const fs = require('fs');
const path = require('path');
const extractXmlFromPdf = require('./extractor');
const config = require('./config');
const logger = require('./logger');

try {
  http
    .createServer((request, response) => {
      if (request.method === 'POST') {
        const fileNameWithExt = request.headers.filename;
        const fileName = fileNameWithExt.split('.')[0];
        const fileExt = fileNameWithExt.split('.')[1];
        let body = [];
        logger.info(`Server got file ${fileNameWithExt}`);

        if (request.headers['content-length'] == 0 || !fileNameWithExt || fileExt !== 'pdf') {
          logger.error('File is not available.');
          response.statusCode = 500;
          response.end('File is not available.');
        } else {
          request.on('data', (chunk) => {
            body.push(Buffer.from(chunk));
          });
          request.on('end', () => {
            try {
              fs.writeFileSync(path.join(__dirname, './PDFs/', `${fileName}.pdf`), Buffer.concat(body));
            } catch (error) {
              logger.error(error.message);
              console.log(error.message);
              response.statusCode = 500;
              response.end(`Error while reading PDF file.\n ${error.message}`);
            }
            try {
              extractXmlFromPdf(`${fileName}.pdf`, () => {
                const xml = fs.readFileSync(path.join(__dirname, './XMLs', `${fileName}.xml`));
                response.write(xml);
                response.end();
                fs.unlink(path.join(__dirname, './PDFs', `${fileName}.pdf`), () => {});
                fs.unlink(path.join(__dirname, './XMLs', `${fileName}.xml`), () => {});
              });
            } catch (error) {
              logger.error(error.message);
              console.log(error.message);
              response.statusCode = 500;
              response.end(`Error while extracting XML from PDF file.\n ${error.message}`);
            }
          });
        }
      } else {
        response.statusCode = 200;
        response.end('Server working: OK');
      }
    })
    .listen(config.PORT, () => console.log(`Server started on port ${config.PORT}`));
} catch (error) {
  logger.error(error.message);
  console.log(error.message);
}
