import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

// 1. Patch YearInput
let yearInputTarget = `const YearInput = ({ label, value, onChange, birthDate }) => {
  let promoAge = null;
  if (birthDate && value && !isNaN(parseInt(value))) {
    promoAge = calculateAge(birthDate, parseInt(value));
  }
  return (
    <div className="flex flex-col w-full">
      <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
      <div className="flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden">`;
let yearInputReplacement = `const YearInput = ({ label, value, onChange, birthDate, bgClass }) => {
  let promoAge = null;
  if (birthDate && value && !isNaN(parseInt(value))) {
    promoAge = calculateAge(birthDate, parseInt(value));
  }
  return (
    <div className="flex flex-col w-full">
      <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
      <div className={cx("flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden", bgClass || "bg-white")}>`;

content = content.replace(yearInputTarget, yearInputReplacement);

// 2. Patch EmployeeModal variable declarations
let empModalVarsTarget = `  const ArrowDiff = ({ currentKey }) => {`;
let empModalVarsReplacement = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";

  const ArrowDiff = ({ currentKey }) => {`;
content = content.replace(empModalVarsTarget, empModalVarsReplacement);

// 3. Patch Next Grade FormSelect in EmployeeModal
// Wait, the "級" input in EmployeeModal is actually in EmployeeFormSection.
// Wait! EmployeeFormSection is not inside EmployeeModal, it is outside!
// So we need to patch EmployeeFormSection to accept isPromoted and promoBg, or calculate them itself.

// Let's rewrite the script to calculate them inside EmployeeFormSection.
