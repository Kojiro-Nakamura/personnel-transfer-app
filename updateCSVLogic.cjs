const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

const baseHeaders = `      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外"`;

const newHeaders = `      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外",
      "【昇進年度】係長級(主査)", "【昇進年度】補佐級I(主任)", "【昇進年度】補佐級II(班長)", "【昇進年度】補佐級III", "【昇進年度】課長級", "【昇進年度】所属長級", "【昇進年度】次長級", "【昇進年度】部長級"`;

content = content.replace(baseHeaders + '\n    ].join(\',\');', newHeaders + '\n    ].join(\',\');');
content = content.replace(baseHeaders + '\n    ];', newHeaders + '\n    ];');

const sampleRowOld = `const sampleRow = "000001,和歌山 太郎,S60.01.01,和歌山大学,H20.04.01,特になし,森林整備課,緑化推進班,班長,班長,補佐級II(班長),1,1,,技術職,森林整備課,緑化推進班,班長,班長,補佐級II(班長),2,1+1,,技術職";`;
const sampleRowNew = `const sampleRow = "000001,和歌山 太郎,S60.01.01,和歌山大学,H20.04.01,特になし,森林整備課,緑化推進班,班長,班長,補佐級II(班長),1,1,,技術職,森林整備課,緑化推進班,班長,班長,補佐級II(班長),2,1+1,,技術職,2015,2018,2022,,,,,";`;
content = content.replace(sampleRowOld, sampleRowNew);


const oldColsParse = `        if (cols.length >= 24) {
          const [,,,,,,,,,,,,,,, nDName, nPName, nGPName, nxTitle, nxGrade, nxYsStr, nxSkStr, nxNote, nxExclude] = cols;
          nTitle = nxTitle || ''; 
          nGrade = nxGrade || ''; 
          nYsStr = nxYsStr || '1'; 
          nSkStr = nxSkStr || ''; 
          nNote = nxNote || ''; 
          nExclude = nxExclude || '';
          nextP = parsePlacement(nDName, nPName, nGPName);
        }`;

const newColsParse = `        if (cols.length >= 24) {
          const [,,,,,,,,,,,,,,, nDName, nPName, nGPName, nxTitle, nxGrade, nxYsStr, nxSkStr, nxNote, nxExclude] = cols;
          nTitle = nxTitle || ''; 
          nGrade = nxGrade || ''; 
          nYsStr = nxYsStr || '1'; 
          nSkStr = nxSkStr || ''; 
          nNote = nxNote || ''; 
          nExclude = nxExclude || '';
          nextP = parsePlacement(nDName, nPName, nGPName);
        }

        let pChief = '', pAss1 = '', pAss2 = '', pAss3 = '', pSec = '', pDiv = '', pDep = '', pDept = '';
        if (cols.length >= 32) {
          const [,,,,,,,,,,,,,,,,,,,,,,,, chief, ass1, ass2, ass3, sec, div, dep, dept] = cols;
          pChief = chief || '';
          pAss1 = ass1 || '';
          pAss2 = ass2 || '';
          pAss3 = ass3 || '';
          pSec = sec || '';
          pDiv = div || '';
          pDep = dep || '';
          pDept = dept || '';
        }`;
content = content.replace(oldColsParse, newColsParse);

const oldNewEmpData = `          nextEmploymentType: nNote, 
          nextExclude: nExclude, 
        };`;

const newNewEmpData = `          nextEmploymentType: nNote, 
          nextExclude: nExclude, 
          promoYearChief: pChief,
          promoYearAssistant1: pAss1,
          promoYearAssistant2: pAss2,
          promoYearAssistant3: pAss3,
          promoYearSecHead: pSec,
          promoYearDivHead: pDiv,
          promoYearDeputyHead: pDep,
          promoYearDeptHead: pDept,
        };`;
content = content.replace(oldNewEmpData, newNewEmpData);

fs.writeFileSync(file, content, 'utf8');
