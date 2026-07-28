const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

const anchor1 = `nextP = parsePlacement(nDName, nPName, nGPName);\n        }`;
const insertion1 = `nextP = parsePlacement(nDName, nPName, nGPName);\n        }

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
if (!content.includes('let pChief')) {
  content = content.replace(anchor1, insertion1);
}

const anchor2 = `nextExclude: nExclude, \n        };`;
const insertion2 = `nextExclude: nExclude, 
          promoYearChief: pChief,
          promoYearAssistant1: pAss1,
          promoYearAssistant2: pAss2,
          promoYearAssistant3: pAss3,
          promoYearSecHead: pSec,
          promoYearDivHead: pDiv,
          promoYearDeputyHead: pDep,
          promoYearDeptHead: pDept,
        };`;
if (!content.includes('promoYearChief: pChief')) {
  content = content.replace(anchor2, insertion2);
}

fs.writeFileSync(file, content, 'utf8');
