const fs = require("fs");
const code = fs.readFileSync("src/utils/exportExcel.js", "utf8");

const lines = code.split("\n");
let inListSheet = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("export const addListSheet")) inListSheet = true;
  if (inListSheet && lines[i].includes(".values = ")) {
    console.log(lines[i-2]);
    console.log(lines[i-1]);
    console.log(lines[i]);
  }
  if (inListSheet && lines[i].includes("export const addBirthYearSheet")) break;
}