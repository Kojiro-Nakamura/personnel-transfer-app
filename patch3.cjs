const fs = require('fs');

let content = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// 1. We replace the noteStr logic to append dNoteText and gNoteText
const noteTarget = `    let noteStr = '';
    const rowNote = notes.find(n => n.targetId === targetId);
    if (rowNote && rowNote.text) noteStr += rowNote.text;`;

const noteRep = `    let noteStr = '';
    const rowNote = notes.find(n => n.targetId === targetId);
    if (rowNote && rowNote.text) noteStr += rowNote.text;

    if (isNewDept && typeof dNoteText !== 'undefined' && dNoteText) {
       if (noteStr) noteStr += ' / ';
       noteStr += \`[部署メモ] \${dNoteText}\`;
    }
    if (isNewGroup && typeof gNoteText !== 'undefined' && gNoteText) {
       if (noteStr) noteStr += ' / ';
       noteStr += \`[班メモ] \${gNoteText}\`;
    }`;

content = content.replace(noteTarget, noteRep);
content = content.replace(noteTarget.replace(/\n/g, '\r\n'), noteRep.replace(/\n/g, '\r\n'));

// 2. We remove cell.note assignments from row.eachCell
const cellTarget = `        if (colNumber === 1 && dNoteText) {
          cell.note = dNoteText;
        }
        if (colNumber === 2 && gNoteText) {
          cell.note = gNoteText;
        }`;

const cellRep = ``;

content = content.replace(cellTarget, cellRep);
content = content.replace(cellTarget.replace(/\n/g, '\r\n'), cellRep.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/utils/exportExcel.js', content, 'utf8');
console.log('Replaced successfully');
