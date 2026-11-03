const fs = require('fs');

let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const start = code.indexOf('export const addCurrentBasePlanSheet');
if (start !== -1) {
    let pre = code.substring(0, start);
    let func = code.substring(start);
    
    // Replace by using regex that ignores the exact template literal contents if needed
    // Actually, let's just find the exact string.
    func = func.replace(
        /const r4Vals = \['部署名', '班・グループ', 'ポスト', 今年度\(\\\$\{targetYear - 1\}\(R\\\$\{targetYear - 2019\}\)\), '', '', '', '', '', '', 来年度\(\\\$\{targetYear\}\(R\\\$\{targetYear - 2018\}\)\)\];/,
        "const r4Vals = ['部署名', '班・グループ', 'ポスト', 今年度($\\{targetYear - 1\\}(R$\\{targetYear - 2019\\})), '', '', '', '', '', 来年度($\\{targetYear\\}(R$\\{targetYear - 2018\\}))];"
    );

    code = pre + func;
    fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');
}