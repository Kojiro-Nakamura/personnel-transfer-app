const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /("【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外")/g;
const replacement = `$1,\n      "【昇進年度】係長級(主査)", "【昇進年度】補佐級I(主任)", "【昇進年度】補佐級II(班長)", "【昇進年度】補佐級III", "【昇進年度】課長級", "【昇進年度】所属長級", "【昇進年度】次長級", "【昇進年度】部長級"`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
