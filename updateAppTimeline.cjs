const fs = require('fs');
const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const timelineLogic = `
        const hireY = selEmp.hireDate ? parseInt(selEmp.hireDate.substring(0, 4)) : null;
        const timeline = [];
        if (hireY) {
          const milestones = [
            { label: '主査', year: selEmp.promoYearChief },
            { label: '主任', year: selEmp.promoYearAssistant1 },
            { label: '班長', year: selEmp.promoYearAssistant2 },
            { label: '補佐III', year: selEmp.promoYearAssistant3 },
            { label: '課長', year: selEmp.promoYearSecHead },
            { label: '所属長', year: selEmp.promoYearDivHead },
            { label: '次長', year: selEmp.promoYearDeputyHead },
            { label: '部長', year: selEmp.promoYearDeptHead },
          ].filter(m => m.year && !isNaN(parseInt(m.year))).sort((a, b) => parseInt(a.year) - parseInt(b.year));
          
          let prevY = hireY;
          let prevLabel = '採用';
          
          if (milestones.length > 0) {
            timeline.push({ label: '採用', isNode: true });
            milestones.forEach(m => {
              const y = parseInt(m.year);
              const diff = y - prevY;
              timeline.push({ label: diff + '年', isNode: false });
              timeline.push({ label: m.label, isNode: true });
              prevY = y;
            });
          }
        }
`;

const renderTimeline = `
            {timeline.length > 0 && (
              <div className="bg-slate-800 text-slate-100 rounded px-3 py-1.5 flex items-center gap-2 overflow-x-auto shadow-inner text-[11px] whitespace-nowrap">
                {timeline.map((item, idx) => (
                  <div key={idx} className={cx("flex items-center", item.isNode ? "font-bold text-emerald-300" : "text-slate-400")}>
                    {item.isNode ? item.label : <><ChevronRight className="w-3 h-3 mx-0.5" />{item.label}<ChevronRight className="w-3 h-3 mx-0.5" /></>}
                  </div>
                ))}
              </div>
            )}
`;

content = content.replace(
  /const dispAge = calculateAge\(selEmp.birthDate, targetYear - 1\);/,
  `const dispAge = calculateAge(selEmp.birthDate, targetYear - 1);\n${timelineLogic}`
);

content = content.replace(
  /<\/div>\n\s*<\/div>\n\s*\);\n\s*\}\)\(\)\}/,
  `</div>\n${renderTimeline}\n          </div>\n        );\n      })()}`
);

fs.writeFileSync(file, content, 'utf8');
