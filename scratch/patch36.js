import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t5 = `<YearInput birthDate={fd.birthDate} label="補佐級III" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} bgClass={activePromoKey === "promoYearAssistant3" ? promoBg : ""} />`;
const r5 = `<YearInput birthDate={fd.birthDate} label="補佐級III" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} bgClass={activePromoKey === "promoYearAssistant3" ? promoBg : ""} borderClass={getPromotedBorderClass("補佐級III(補佐兼班長)")} />`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, t5, r5);
if (!replacedStr) {
  console.log("Failed t5");
  process.exit(1);
}

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', replacedStr);
console.log("Patched YearInput t5 in EmployeeComponents.jsx");
