const ExcelJS = require("exceljs");
async function run() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Test");
  
  const targetYear = 2027;
  const historyYears = [2027];
  
  const r4Vals = ['部署名', '配属希望', '特殊事情', `今年度`, '', '', '', `来年度`, '', '', '', '', ''];
  r4Vals.push('氏名', `年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('履歴');
    else r4Vals.push('');
  });
  const r4 = ws.getRow(4);
  r4.values = r4Vals;
  
  const r5Vals = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考', ''];
  r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '採用', '係長', '補佐I', '補佐II', '補佐III', '課長', '所属長', '次長', '部長', '来年度');
  historyYears.forEach(y => r5Vals.push(y));
  const r5 = ws.getRow(5);
  r5.values = r5Vals;
  
  await wb.xlsx.writeFile("scratch/test_export.xlsx");
  console.log("Done");
}
run();