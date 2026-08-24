const { getPromotedBgColorCode } = require('../src/utils/helpers.js'); // can't require ES module.

const emp2 = { currentGrade: "課長級", nextGrade: "所属長級" };
const isNextYear = true;

const grade = isNextYear ? (emp2.nextGrade || emp2.currentGrade) : emp2.currentGrade;
console.log("Grade for emp-2:", grade);