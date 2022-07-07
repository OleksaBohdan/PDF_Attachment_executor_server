const http = require('http');
const fs = require('fs');
const path = require('path');
const extractXmlFromPdf = require('./extractor');
const config = require('./config');

try {
  http
    .createServer((request, response) => {
      const fileNameWithExt = request.headers.filename;
      const fileName = fileNameWithExt.split('.')[0];
      const fileExt = fileNameWithExt.split('.')[1];
      let body = [];
      console.log(`Server got file ${fileNameWithExt}`);

      if (fileExt !== 'pdf') {
        console.log('File extension is not pdf.');
        response.statusCode = 500;
        response.end(`File extension is not pdf: ${fileExt}`);
      }

      request.on('data', (chunk) => {
        body.push(Buffer.from(chunk));
      });
      request.on('end', () => {
        try {
          fs.writeFileSync(path.join(__dirname, './PDFs/', `${fileName}.pdf`), Buffer.concat(body));
        } catch (error) {
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
          console.log(error.message);
          response.statusCode = 500;
          response.end(`Error while extracting XML from PDF file.\n ${error.message}`);
        }
      });
    })
    .listen(config.PORT, () => console.log(`Server started on port ${config.PORT}`));
} catch (error) {
  console.log(error.message);
}
