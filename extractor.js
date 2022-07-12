// const pdfjs = require('pdfjs-dist/build/pdf');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

module.exports = function extractXmlFromPdf(filename, cb) {
  return new Promise(function (resolve, reject) {
    const fileName = filename;
    const filePath = path.join(__dirname, './PDFs/', fileName);
    const filenameWithExt = filePath.replace(/^.*[\\\/]/, ''); // - FileName with extension
    const fileNameArr = filenameWithExt.split('.');
    const nameWithoutExt = fileNameArr[0]; // - FileName without extension

    const getAttachment = async function (src) {
      const doc = await pdfjs.getDocument(src).promise;
      return await doc.getAttachments();
    };

    const createXML = async function (src) {
      let attachment;
      try {
        attachment = await getAttachment(src);
        const unit8 = attachment['ZUGFeRD-invoice.xml']['content'];
        const str = new TextDecoder('utf-8').decode(unit8);
        fs.writeFileSync(path.join(__dirname, './XMLs/', `${nameWithoutExt}.xml`), str, 'utf8');
        cb();
        resolve();
        return;
      } catch (error) {
        logger.error(error.message);
        reject(error);
      }
    };

    createXML(filePath);
  });
};
