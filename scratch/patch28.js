import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t1 = `import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName } from '../../utils/helpers.js';`;
const r1 = `import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName, getEraFormattedYear } from '../../utils/helpers.js';`;

const t2 = `  const [editCurrent, setEditCurrent] = useState(false);
  
  useEffect(() => { `;
const r2 = `  const [editCurrent, setEditCurrent] = useState(false);
  
  const getEraStr = (dateStr) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\\d{4})/);
    if (!match) return '';
    const y = parseInt(match[1], 10);
    const eraFormatted = getEraFormattedYear(y);
    const eraMatch = eraFormatted.match(/\\((.*?)\\)/);
    return eraMatch ? \`(\${eraMatch[1]})\` : '';
  };
  
  useEffect(() => { `;

const t3 = `              <FormInput label="生年月日" type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-[115px] shrink-0" />
              <FormInput label="学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="flex-1 min-w-0" />
              <FormInput label="採用年月" type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-[115px] shrink-0" />`;
const r3 = `              <FormInput label={\`生年月日\${getEraStr(fd.birthDate)}\`} type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-[130px] shrink-0" />
              <FormInput label="学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="flex-1 min-w-0" />
              <FormInput label={\`採用年月\${getEraStr(fd.hireDate)}\`} type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-[130px] shrink-0" />`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let newContent = content;
let replaced = replaceWithCRLF(newContent, t1, r1);
if (!replaced) { console.log("Failed t1"); process.exit(1); }
newContent = replaced;

replaced = replaceWithCRLF(newContent, t2, r2);
if (!replaced) { console.log("Failed t2"); process.exit(1); }
newContent = replaced;

replaced = replaceWithCRLF(newContent, t3, r3);
if (!replaced) { console.log("Failed t3"); process.exit(1); }
newContent = replaced;

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', newContent);
console.log("Patched EmployeeComponents.jsx for era strings");
