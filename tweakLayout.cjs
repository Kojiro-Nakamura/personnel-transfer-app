const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Move the ArrowDiff for promoYearSecHead
// It is currently between Assistant3 and the Bottom Row comment.
const targetArrow = '<ArrowDiff currentKey="promoYearSecHead" />';
content = content.replace(targetArrow, '<div className="w-full opacity-0 pointer-events-none"></div>'); // Replace it with an empty spacer so top row has 10 items (9 + empty).

// In the bottom row, replace the second empty spacer with the targetArrow
const bottomRowSpacers = `<div className="w-full opacity-0 pointer-events-none"></div>
              <div className="w-full opacity-0 pointer-events-none"></div>`;
const newBottomRowStart = `<div className="w-full opacity-0 pointer-events-none"></div>
              <ArrowDiff currentKey="promoYearSecHead" />`;
content = content.replace(bottomRowSpacers, newBottomRowStart);

// 2. Fix the 採用 block
const oldHireBlock = `<div className="flex flex-col mb-1.5 w-full shrink-0">
                <span className="text-[11px] font-bold text-slate-600 mb-1">採用</span>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-bold shadow-inner text-center">
                  {fd.hireDate ? fd.hireDate.substring(0, 4) : '----'}
                </div>
              </div>`;
              
const newHireBlock = `<div className="flex flex-col w-full shrink-0">
                <span className="text-[11px] font-bold text-slate-600 mb-1">採用</span>
                <div className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-sm font-bold shadow-inner text-center border border-slate-300 h-[30px] flex items-center justify-center">
                  {fd.hireDate ? fd.hireDate.substring(0, 4) : '----'}
                </div>
              </div>`;
content = content.replace(oldHireBlock, newHireBlock);

fs.writeFileSync(file, content, 'utf8');
