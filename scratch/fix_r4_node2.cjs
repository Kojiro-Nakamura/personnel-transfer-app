const fs = require('fs');

let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const start = code.indexOf('export const addCurrentBasePlanSheet');
if (start !== -1) {
    let pre = code.substring(0, start);
    let func = code.substring(start);
    
    func = func.replace(
        " const r4Vals = ['部署名', '班・グループ', 'ポスト', 今年度((R)), '', '', '', '', '', '', 来年度((R))];",
        " const r4Vals = ['部署名', '班・グループ', 'ポスト', 今年度((R)), '', '', '', '', '', 来年度((R))];"
    );

    code = pre + func;
    fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');
}