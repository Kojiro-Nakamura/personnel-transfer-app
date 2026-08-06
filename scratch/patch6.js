import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const anchor = "  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';\n\n  return (";
const newCode = "  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';\n\n  const isPromoted = !isCurrent && isPromotedGrade(fd.currentGrade, fd.nextGrade);\n  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : '';\n\n  return (";

const altAnchor = "  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';\r\n\r\n  return (";
const altNewCode = "  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';\r\n\r\n  const isPromoted = !isCurrent && isPromotedGrade(fd.currentGrade, fd.nextGrade);\r\n  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : '';\r\n\r\n  return (";

if(content.includes(anchor)) {
  content = content.replace(anchor, newCode);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Fixed with LF');
} else if (content.includes(altAnchor)) {
  content = content.replace(altAnchor, altNewCode);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Fixed with CRLF');
} else {
  console.log('Not found');
}
