import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t1 = `const YearInput = ({ label, value, onChange, birthDate, bgClass }) => {
  let promoAge = null;
  if (birthDate && value && !isNaN(parseInt(value))) {
    promoAge = calculateAge(birthDate, parseInt(value));
  }
  return (
    <div className="flex flex-col w-full">
      <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
      <div className={cx("flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden", bgClass || "bg-white")}>`;

const r1 = `const YearInput = ({ label, value, onChange, birthDate, bgClass, borderClass }) => {
  let promoAge = null;
  if (birthDate && value && !isNaN(parseInt(value))) {
    promoAge = calculateAge(birthDate, parseInt(value));
  }
  const defaultBorder = "border-slate-300";
  const activeBorder = (value && borderClass) ? \`border-2 \${borderClass}\` : defaultBorder;
  return (
    <div className="flex flex-col w-full">
      <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
      <div className={cx("flex items-center w-full px-1.5 py-1 text-sm border rounded shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden", activeBorder, bgClass || "bg-white")}>`;

const t2 = `<YearInput birthDate={fd.birthDate} label="係長級(主査)" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} bgClass={activePromoKey === "promoYearChief" ? promoBg : ""} />`;
const r2 = `<YearInput birthDate={fd.birthDate} label="係長級(主査)" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} bgClass={activePromoKey === "promoYearChief" ? promoBg : ""} borderClass={getPromotedBorderClass("係長級(主査)")} />`;

const t3 = `<YearInput birthDate={fd.birthDate} label="補佐級I(主任)" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} bgClass={activePromoKey === "promoYearAssistant1" ? promoBg : ""} />`;
const r3 = `<YearInput birthDate={fd.birthDate} label="補佐級I(主任)" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} bgClass={activePromoKey === "promoYearAssistant1" ? promoBg : ""} borderClass={getPromotedBorderClass("補佐級I(主任)")} />`;

const t4 = `<YearInput birthDate={fd.birthDate} label="補佐級II(班長)" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} bgClass={activePromoKey === "promoYearAssistant2" ? promoBg : ""} />`;
const r4 = `<YearInput birthDate={fd.birthDate} label="補佐級II(班長)" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} bgClass={activePromoKey === "promoYearAssistant2" ? promoBg : ""} borderClass={getPromotedBorderClass("補佐級II(班長)")} />`;

const t5 = `<YearInput birthDate={fd.birthDate} label="補佐兼班長" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} bgClass={activePromoKey === "promoYearAssistant3" ? promoBg : ""} />`;
const r5 = `<YearInput birthDate={fd.birthDate} label="補佐兼班長" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} bgClass={activePromoKey === "promoYearAssistant3" ? promoBg : ""} borderClass={getPromotedBorderClass("補佐級III(補佐兼班長)")} />`;

const t6 = `<YearInput birthDate={fd.birthDate} label="課長級" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} bgClass={activePromoKey === "promoYearSecHead" ? promoBg : ""} />`;
const r6 = `<YearInput birthDate={fd.birthDate} label="課長級" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} bgClass={activePromoKey === "promoYearSecHead" ? promoBg : ""} borderClass={getPromotedBorderClass("課長級")} />`;

const t7 = `<YearInput birthDate={fd.birthDate} label="所属長級" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} bgClass={activePromoKey === "promoYearDivHead" ? promoBg : ""} />`;
const r7 = `<YearInput birthDate={fd.birthDate} label="所属長級" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} bgClass={activePromoKey === "promoYearDivHead" ? promoBg : ""} borderClass={getPromotedBorderClass("所属長級")} />`;

const t8 = `<YearInput birthDate={fd.birthDate} label="次長級" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} bgClass={activePromoKey === "promoYearDeputyHead" ? promoBg : ""} />`;
const r8 = `<YearInput birthDate={fd.birthDate} label="次長級" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} bgClass={activePromoKey === "promoYearDeputyHead" ? promoBg : ""} borderClass={getPromotedBorderClass("次長級")} />`;

const t9 = `<YearInput birthDate={fd.birthDate} label="部長級" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} bgClass={activePromoKey === "promoYearDeptHead" ? promoBg : ""} />`;
const r9 = `<YearInput birthDate={fd.birthDate} label="部長級" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} bgClass={activePromoKey === "promoYearDeptHead" ? promoBg : ""} borderClass={getPromotedBorderClass("部長級")} />`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let newContent = content;

const replacements = [
  {t: t1, r: r1, n: 't1'},
  {t: t2, r: r2, n: 't2'},
  {t: t3, r: r3, n: 't3'},
  {t: t4, r: r4, n: 't4'},
  {t: t5, r: r5, n: 't5'},
  {t: t6, r: r6, n: 't6'},
  {t: t7, r: r7, n: 't7'},
  {t: t8, r: r8, n: 't8'},
  {t: t9, r: r9, n: 't9'},
];

for (const rep of replacements) {
  let replacedStr = replaceWithCRLF(newContent, rep.t, rep.r);
  if (!replacedStr) {
    console.log("Failed " + rep.n);
    process.exit(1);
  }
  newContent = replacedStr;
}

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', newContent);
console.log("Patched YearInputs with borderClass in EmployeeComponents.jsx");
