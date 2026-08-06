import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

// 1. Remove inputClassName={promoBg}
content = content.replace(/<FormInput label="年数" type="number" disabled={disabled} value={fd\[`\${p}Years`\]} onChange={v => setFd\(\{\.\.\.fd, \[`\${p}Years`\]: v\}\)} className="w-16" inputClassName=\{promoBg\} \/>/g, '<FormInput label="年数" type="number" disabled={disabled} value={fd[`${p}Years`]} onChange={v => setFd({...fd, [`${p}Years`]: v})} className="w-16" />');

// 2. Define GRADE_TO_PROMO_KEY at the top
if (!content.includes('const GRADE_TO_PROMO_KEY = {')) {
  const t = "export const EmployeeFormSection";
  const r = `const GRADE_TO_PROMO_KEY = {
  "係長級(主査)": "promoYearChief",
  "補佐級I(主任)": "promoYearAssistant1",
  "補佐級II(班長)": "promoYearAssistant2",
  "補佐級III(補佐兼班長)": "promoYearAssistant3",
  "課長級": "promoYearSecHead",
  "所属長級": "promoYearDivHead",
  "次長級": "promoYearDeputyHead",
  "部長級": "promoYearDeptHead"
};

export const EmployeeFormSection`;
  content = content.replace(t, r);
}

// 3. Update EmployeeFormSection handleGradeChange
const t3 = `      const gradeToPromoKey = {
        "係長級(主査)": "promoYearChief",
        "補佐級I(主任)": "promoYearAssistant1",
        "補佐級II(班長)": "promoYearAssistant2",
        "補佐級III(補佐兼班長)": "promoYearAssistant3",
        "課長級": "promoYearSecHead",
        "所属長級": "promoYearDivHead",
        "次長級": "promoYearDeputyHead",
        "部長級": "promoYearDeptHead"
      };
      const promoKey = gradeToPromoKey[v];`;
const r3 = `      const promoKey = GRADE_TO_PROMO_KEY[v];`;
content = content.replace(t3, r3);

// 4. Update EmployeeModal to define activePromoKey
const t4 = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);\n  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";`;
const t4_crlf = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);\r\n  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";`;
const r4 = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";
  const activePromoKey = isPromoted ? GRADE_TO_PROMO_KEY[fd.nextGrade] : null;`;
if (content.includes(t4)) content = content.replace(t4, r4);
else if (content.includes(t4_crlf)) content = content.replace(t4_crlf, r4.replace(/\n/g, '\r\n'));


// 5. Update ArrowDiff
const t5 = `<span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded mb-0.5 whitespace-nowrap">{diff !== null && diff >= 0 ? diff + 1 : 1}年目</span>`;
const r5 = `<span className={cx("text-[10px] font-bold text-emerald-600 px-1 rounded mb-0.5 whitespace-nowrap", currentKey === activePromoKey && promoBg ? promoBg : "bg-emerald-50")}>{diff !== null && diff >= 0 ? diff + 1 : 1}年目</span>`;
content = content.replace(t5, r5);

const t6 = `<span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1 rounded border border-blue-200 mb-0.5 whitespace-nowrap">{diff !== null && diff >= 0 ? diff : 0}年目</span>`;
const r6 = `<span className={cx("text-[10px] font-bold text-blue-700 px-1 rounded border border-blue-200 mb-0.5 whitespace-nowrap", currentKey === activePromoKey && promoBg ? promoBg : "bg-blue-100")}>{diff !== null && diff >= 0 ? diff : 0}年目</span>`;
content = content.replace(t6, r6);

// 6. Update YearInputs
const yrInputs = [
  { key: "promoYearChief", search: '<YearInput birthDate={fd.birthDate} label="係長級(主査)" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} />' },
  { key: "promoYearAssistant1", search: '<YearInput birthDate={fd.birthDate} label="補佐級I(主任)" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} />' },
  { key: "promoYearAssistant2", search: '<YearInput birthDate={fd.birthDate} label="補佐級II(班長)" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} />' },
  { key: "promoYearAssistant3", search: '<YearInput birthDate={fd.birthDate} label="補佐級III" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} />' },
  { key: "promoYearSecHead", search: '<YearInput birthDate={fd.birthDate} label="課長級" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} />' },
  { key: "promoYearDivHead", search: '<YearInput birthDate={fd.birthDate} label="所属長級" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} />' },
  { key: "promoYearDeputyHead", search: '<YearInput birthDate={fd.birthDate} label="次長級" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} />' },
  { key: "promoYearDeptHead", search: '<YearInput birthDate={fd.birthDate} label="部長級" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} />' }
];

yrInputs.forEach(yi => {
  const r = yi.search.replace('/>', `bgClass={activePromoKey === "${yi.key}" ? promoBg : ""} />`);
  content = content.replace(yi.search, r);
});

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Patched EmployeeComponents.jsx completely');
