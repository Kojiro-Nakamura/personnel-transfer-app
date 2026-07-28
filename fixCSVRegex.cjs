const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

const old1 = /nextP = parsePlacement\(nDName, nPName, nGPName\);\s*\}/;
const new1 = `nextP = parsePlacement(nDName, nPName, nGPName);
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
content = content.replace(old1, new1);

const old2 = /nextExclude:\s*nExclude,?\s*\};/;
const new2 = `nextExclude: nExclude, 
          promoYearChief: pChief,
          promoYearAssistant1: pAss1,
          promoYearAssistant2: pAss2,
          promoYearAssistant3: pAss3,
          promoYearSecHead: pSec,
          promoYearDivHead: pDiv,
          promoYearDeputyHead: pDep,
          promoYearDeptHead: pDept,
        };`;
content = content.replace(old2, new2);

fs.writeFileSync(file, content, 'utf8');
