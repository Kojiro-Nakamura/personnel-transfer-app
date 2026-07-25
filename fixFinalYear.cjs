const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix calculation:
content = content.replace(
  /const currentYear = targetYear - 1;\n\s*const yearsSinceLast = lastY !== null \? \(currentYear - lastY\) : null;/,
  `const yearsSinceLast = lastY !== null ? (targetYear - lastY) : null;`
);

// Remove the misplaced UI node
const misplacedUINode = `<div className="flex flex-col items-center mx-1 justify-end h-[62px]">
                <ArrowRight className="w-4 h-4 text-slate-300 mb-1" />
              </div>
              <div className="flex flex-col mb-1.5 ml-1">
                <span className="text-[11px] font-bold text-blue-700 mb-1">現在まで</span>
                <div className="px-3 py-1.5 bg-blue-100 border border-blue-200 text-blue-800 rounded text-sm font-bold shadow-inner">
                  {yearsSinceLast !== null ? Math.max(0, yearsSinceLast) + '年' : '----'}
                </div>
              </div>`;

// Wait, because of mojibake in my powershell regex, I should just use regex carefully.
// Actually, I can just replace the whole block starting from promoYearDeptHead arrow to the end of the div.

const regexTarget = /<ArrowDiff diff=\{getDiffFor\('promoYearDeptHead'\)\} \/>\s*<div className="flex flex-col items-center mx-1 justify-end h-\[62px\]">\s*<ArrowRight className="w-4 h-4 text-slate-300 mb-1" \/>\s*<\/div>\s*<div className="flex flex-col mb-1\.5 ml-1">\s*<span className="text-\[11px\] font-bold text-blue-700 mb-1">.*?<\/span>\s*<div className="px-3 py-1\.5 bg-blue-100 border border-blue-200 text-blue-800 rounded text-sm font-bold shadow-inner">\s*\{yearsSinceLast !== null \? Math\.max\(0, yearsSinceLast\) \+ '.*?' : '----'\}\s*<\/div>\s*<\/div>\s*<div className="w-24"><FormInput label=".*?" type="number" placeholder="YYYY" value=\{fd\.promoYearDeptHead\} onChange=\{v => setFd\(\{\.\.\.fd, promoYearDeptHead: v\}\)\} \/><\/div>\s*<\/div>/g;

const replacement = `<ArrowDiff diff={getDiffFor('promoYearDeptHead')} />
              <div className="w-24"><FormInput label="部長級" type="number" placeholder="YYYY" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} /></div>
              
              <div className="flex flex-col items-center mx-1 justify-end h-[62px]">
                <ArrowRight className="w-4 h-4 text-slate-300 mb-1" />
              </div>
              <div className="flex flex-col mb-1.5 ml-1">
                <span className="text-[11px] font-bold text-blue-700 mb-1">来年度まで</span>
                <div className="px-3 py-1.5 bg-blue-100 border border-blue-200 text-blue-800 rounded text-sm font-bold shadow-inner">
                  {yearsSinceLast !== null ? Math.max(0, yearsSinceLast) + '年' : '----'}
                </div>
              </div>
            </div>`;

content = content.replace(regexTarget, replacement);
fs.writeFileSync(file, content, 'utf8');
