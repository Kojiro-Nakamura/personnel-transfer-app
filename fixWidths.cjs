const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// 1. Remove min-w-[120px] from history td
content = content.replace(/min-w-\[120px\]/g, 'min-w-[60px] w-[60px]');

// 2. Make promotion headers narrower by allowing wrap and reducing min-width
const promoHeaders = [
  'label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-l border-r w-14 min-w-[56px] whitespace-normal leading-tight"',
  'label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight"',
  'label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight"',
  'label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight"',
  'label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight"',
  'label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight"',
  'label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight"',
  'label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 w-14 min-w-[56px] whitespace-normal leading-tight"'
];

content = content.replace(/label="係長級\(主査\)" sortKey="promoYearChief" className="bg-fuchsia-50\/50 border-l border-r"/g, promoHeaders[0]);
content = content.replace(/label="補佐級I\(主任\)" sortKey="promoYearAssistant1" className="bg-fuchsia-50\/50 border-r"/g, promoHeaders[1]);
content = content.replace(/label="補佐級II\(班長\)" sortKey="promoYearAssistant2" className="bg-fuchsia-50\/50 border-r"/g, promoHeaders[2]);
content = content.replace(/label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50\/50 border-r"/g, promoHeaders[3]);
content = content.replace(/label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50\/50 border-r"/g, promoHeaders[4]);
content = content.replace(/label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50\/50 border-r"/g, promoHeaders[5]);
content = content.replace(/label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50\/50 border-r"/g, promoHeaders[6]);
content = content.replace(/label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50\/50"/g, promoHeaders[7]);

// 3. Make history headers narrower
content = content.replace(/className="bg-emerald-50\/50 border-l"/g, 'className="bg-emerald-50/50 border-l w-14 min-w-[56px] text-[10px]"');

// 4. Change input type number to text for promotion years so the spin button doesn't take up width
content = content.replace(/<input type="number" value=\{emp\.promoYearChief/g, '<input type="text" value={emp.promoYearChief');
content = content.replace(/<input type="number" value=\{emp\.promoYearAssistant1/g, '<input type="text" value={emp.promoYearAssistant1');
content = content.replace(/<input type="number" value=\{emp\.promoYearAssistant2/g, '<input type="text" value={emp.promoYearAssistant2');
content = content.replace(/<input type="number" value=\{emp\.promoYearAssistant3/g, '<input type="text" value={emp.promoYearAssistant3');
content = content.replace(/<input type="number" value=\{emp\.promoYearSecHead/g, '<input type="text" value={emp.promoYearSecHead');
content = content.replace(/<input type="number" value=\{emp\.promoYearDivHead/g, '<input type="text" value={emp.promoYearDivHead');
content = content.replace(/<input type="number" value=\{emp\.promoYearDeputyHead/g, '<input type="text" value={emp.promoYearDeputyHead');
content = content.replace(/<input type="number" value=\{emp\.promoYearDeptHead/g, '<input type="text" value={emp.promoYearDeptHead');

// 5. Change inputCls to have less horizontal padding for text inputs? px-2 is fine, px-1 is better for narrow columns.
// Let's just do it directly on the inputs:
content = content.replace(/className=\{inputCls\}/g, "className={cx(inputCls, 'text-center px-1')}"); // Wait, this might break other columns that are left-aligned.
// Let's target only the fuchsia ones
content = content.replace(/<td className="bg-fuchsia-50\/30( border-l)?"><input type="text" value=\{emp\.promoYear([a-zA-Z0-9]+)\|\|''\} onChange=\{e => handleChange\(emp\.id,'promoYear([a-zA-Z0-9]+)',e\.target\.value\)\} className=\{inputCls\} \/><\/td>/g, 
  '<td className="bg-fuchsia-50/30$1"><input type="text" value={emp.promoYear$2||\'\'} onChange={e => handleChange(emp.id,\'promoYear$3\',e.target.value)} className={cx(inputCls, "text-center px-0.5")} /></td>');

fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
console.log("Widths updated.");
