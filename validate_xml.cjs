const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

const xml = fs.readFileSync('test_xlsx_out/xl/worksheets/sheet2.xml', 'utf8');
parser.parseString(xml, (err, result) => {
  if (err) {
    console.error('XML Parse Error:', err);
  } else {
    console.log('XML is valid.');
  }
});
