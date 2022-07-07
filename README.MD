#Get attached XML from PDF

DOCUMENTATION

require POST request with body {pdf.file},
if pdf.file has xml attachment
server will return:
{status: 200} & {body with xml file}

\*Important notes:
xml attached file should be named "ZUGFeRD-invoice.xml"
