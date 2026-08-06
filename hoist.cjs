const fs = require('fs');
let lines = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8').split('\n');

const stateStart = lines.findIndex(l => l.includes('const [localEmps, setLocalEmps] = useState([]'));
const stateEnd = lines.findIndex((l, i) => i > stateStart && l.includes('setAlertMessage'));

const states = lines.slice(stateStart, stateEnd + 1);

// Remove the states from their original place
lines.splice(stateStart, stateEnd - stateStart + 2); // remove an extra blank line if any

// Find the start of BulkEditModal
const compStart = lines.findIndex(l => l.includes('export const BulkEditModal = ({'));
lines.splice(compStart + 1, 0, ...states);

fs.writeFileSync('src/components/modals/Modals.jsx', lines.join('\n'), 'utf8');
console.log("States hoisted.");
