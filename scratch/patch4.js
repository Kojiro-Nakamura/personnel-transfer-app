import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

// 1. Patch YearInput
const yearInputTarget = `const YearInput = ({ label, value, onChange, birthDate }) => {
  let promoAge = null;
  if (birthDate && value && !isNaN(parseInt(value))) {
    promoAge = calculateAge(birthDate, parseInt(value));
  }
  return (
    <div className="flex flex-col w-full">
      <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
      <div className="flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden">`;
const yearInputReplacement = `const YearInput = ({ label, value, onChange, birthDate, bgClass }) => {
  let promoAge = null;
  if (birthDate && value && !isNaN(parseInt(value))) {
    promoAge = calculateAge(birthDate, parseInt(value));
  }
  return (
    <div className="flex flex-col w-full">
      <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
      <div className={cx("flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden", bgClass || "bg-white")}>`;

content = content.replace(yearInputTarget, yearInputReplacement);

// 2. Patch EmployeeFormSection
const formSectionTarget = `export const EmployeeFormSection = ({ title, isCurrent, disabled, fd, setFd, departments, editCurrent, setEditCurrent }) => {
  const p = isCurrent ? 'current' : 'next'; 
  const pd = isCurrent ? 'currentDeptId' : 'departmentId'; 
  const pp = isCurrent ? 'currentPostId' : 'postId'; 
  const pg = isCurrent ? 'currentGroupId' : 'groupId'; 
  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';`;
const formSectionReplacement = `export const EmployeeFormSection = ({ title, isCurrent, disabled, fd, setFd, departments, editCurrent, setEditCurrent }) => {
  const p = isCurrent ? 'current' : 'next'; 
  const pd = isCurrent ? 'currentDeptId' : 'departmentId'; 
  const pp = isCurrent ? 'currentPostId' : 'postId'; 
  const pg = isCurrent ? 'currentGroupId' : 'groupId'; 
  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';

  const isPromoted = !isCurrent && isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";`;

content = content.replace(formSectionTarget, formSectionReplacement);

// 3. Patch EmployeeFormSection's Grade FormSelect
const gradeSelectTarget = `<FormSelect label="級" disabled={disabled} value={fd[\`\${p}Grade\`]} onChange={v => setFd({...fd, [\`\${p}Grade\`]: v})} options={GRADE_OPTIONS} className="w-[140px]" />`;
const gradeSelectReplacement = `<FormSelect label="級" disabled={disabled} value={fd[\`\${p}Grade\`]} onChange={v => setFd({...fd, [\`\${p}Grade\`]: v})} options={GRADE_OPTIONS} className="w-[140px]" selectClassName={promoBg} />`;

content = content.replace(gradeSelectTarget, gradeSelectReplacement);

// 4. Patch EmployeeModal variable declarations
const empModalVarsTarget = `  const pKeys = ['hire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];`;
const empModalVarsReplacement = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";

  const pKeys = ['hire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];`;

content = content.replace(empModalVarsTarget, empModalVarsReplacement);

// 5. Patch YearInput usages in EmployeeModal
const yearInputUsagesTarget = `<YearInput birthDate={fd.birthDate} label="係長級(主査)" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} />
              <ArrowDiff currentKey="promoYearAssistant1" />
              <YearInput birthDate={fd.birthDate} label="補佐級I(主任)" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} />
              <ArrowDiff currentKey="promoYearAssistant2" />
              <YearInput birthDate={fd.birthDate} label="補佐級II(班長)" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} />
              <ArrowDiff currentKey="promoYearAssistant3" />
              <YearInput birthDate={fd.birthDate} label="補佐級III" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} />
              <div className="w-full opacity-0 pointer-events-none"></div>

              {/* Bottom Row */}
              <div className="w-full opacity-0 pointer-events-none"></div>
              <ArrowDiff currentKey="promoYearSecHead" />
              <YearInput birthDate={fd.birthDate} label="課長級" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} />
              <ArrowDiff currentKey="promoYearDivHead" />
              <YearInput birthDate={fd.birthDate} label="所属長級" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} />
              <ArrowDiff currentKey="promoYearDeputyHead" />
              <YearInput birthDate={fd.birthDate} label="次長級" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} />
              <ArrowDiff currentKey="promoYearDeptHead" />
              <YearInput birthDate={fd.birthDate} label="部長級" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} />`;
const yearInputUsagesReplacement = `<YearInput birthDate={fd.birthDate} label="係長級(主査)" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} bgClass={isPromoted && fd.nextGrade === "係長級(主査)" ? promoBg : ""} />
              <ArrowDiff currentKey="promoYearAssistant1" />
              <YearInput birthDate={fd.birthDate} label="補佐級I(主任)" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} bgClass={isPromoted && fd.nextGrade === "補佐級I(主任)" ? promoBg : ""} />
              <ArrowDiff currentKey="promoYearAssistant2" />
              <YearInput birthDate={fd.birthDate} label="補佐級II(班長)" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} bgClass={isPromoted && fd.nextGrade === "補佐級II(班長)" ? promoBg : ""} />
              <ArrowDiff currentKey="promoYearAssistant3" />
              <YearInput birthDate={fd.birthDate} label="補佐級III" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} bgClass={isPromoted && fd.nextGrade === "補佐級III(補佐兼班長)" ? promoBg : ""} />
              <div className="w-full opacity-0 pointer-events-none"></div>

              {/* Bottom Row */}
              <div className="w-full opacity-0 pointer-events-none"></div>
              <ArrowDiff currentKey="promoYearSecHead" />
              <YearInput birthDate={fd.birthDate} label="課長級" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} bgClass={isPromoted && fd.nextGrade === "課長級" ? promoBg : ""} />
              <ArrowDiff currentKey="promoYearDivHead" />
              <YearInput birthDate={fd.birthDate} label="所属長級" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} bgClass={isPromoted && fd.nextGrade === "所属長級" ? promoBg : ""} />
              <ArrowDiff currentKey="promoYearDeputyHead" />
              <YearInput birthDate={fd.birthDate} label="次長級" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} bgClass={isPromoted && fd.nextGrade === "次長級" ? promoBg : ""} />
              <ArrowDiff currentKey="promoYearDeptHead" />
              <YearInput birthDate={fd.birthDate} label="部長級" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} bgClass={isPromoted && fd.nextGrade === "部長級" ? promoBg : ""} />`;

content = content.replace(yearInputUsagesTarget, yearInputUsagesReplacement);

// 6. Patch History cell background
const historyTarget = `                  const isFuture = h.year >= (targetYear + 1);
                  const isNext = h.year === targetYear;
                  return (
                    <div key={i} className="relative flex flex-col bg-white border px-2 py-1 rounded shadow-sm w-full min-w-0" title={h.department || '-'}>`;
const historyReplacement = `                  const isFuture = h.year >= (targetYear + 1);
                  const isNext = h.year === targetYear;
                  const cellBg = (isNext && isPromoted) ? promoBg : "bg-white";
                  return (
                    <div key={i} className={cx("relative flex flex-col border px-2 py-1 rounded shadow-sm w-full min-w-0", cellBg)} title={h.department || '-'}>`;

content = content.replace(historyTarget, historyReplacement);

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Successfully patched EmployeeComponents.jsx');
