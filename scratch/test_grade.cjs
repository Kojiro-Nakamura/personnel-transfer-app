const emp1 = { currentGrade: "係長級(主査)", nextGrade: "補佐級I(主任)" };
const emp2 = { currentGrade: "補佐級I(主任)", nextGrade: "" };

const isNextYear = true;

console.log("emp1:", isNextYear ? (emp1.nextGrade || emp1.currentGrade) : emp1.currentGrade);
console.log("emp2:", isNextYear ? (emp2.nextGrade || emp2.currentGrade) : emp2.currentGrade);