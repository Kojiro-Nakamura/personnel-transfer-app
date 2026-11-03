const { getGradeLevel, getPromotedBgColorCode } = require('./src/utils/helpers.js');

const extEmp = {
  currentGrade: '係長級(主査)',
  nextGrade: '補佐級I(主任)',
};

if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
    console.log("PROMOTED!");
    const c = getPromotedBgColorCode(extEmp.nextGrade);
    console.log("Color:", c);
} else {
    console.log("NOT PROMOTED");
}