const fs = require('fs');
const unzipper = require('unzipper');

async function extract() {
  await new Promise((resolve) => {
    fs.createReadStream('test.xlsx')
      .pipe(unzipper.Extract({ path: 'test_xlsx_out' }))
      .on('close', resolve);
  });
  
  // Sheet 2 is usually Simple Plan
  const xml = fs.readFileSync('test_xlsx_out/xl/worksheets/sheet2.xml', 'utf8');
  if (xml.includes('Medium')) {
    console.log("Sheet2 contains Medium borders!");
  }
}
extract();