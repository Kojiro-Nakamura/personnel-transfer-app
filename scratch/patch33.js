import fs from 'fs';
let content = fs.readFileSync('src/utils/helpers.js', 'utf8');

const t = `export const getPromotedBgClass = (grade) => {
  switch (grade) {
    case "部長級": return "bg-purple-300";
    case "次長級": return "bg-red-400";
    case "所属長級": return "bg-orange-300";
    case "課長級": return "bg-yellow-300";
    case "補佐級III(補佐兼班長)": return "bg-sky-300";
    case "補佐級II(班長)": return "bg-emerald-300";
    case "補佐級I(主任)": return "bg-pink-300";
    case "係長級(主査)": return "bg-slate-300";
    case "一般": return "bg-indigo-200";
    default: return "";
  }
};`;

const r = `export const getPromotedBgClass = (grade) => {
  switch (grade) {
    case "部長級": return "bg-purple-300";
    case "次長級": return "bg-red-400";
    case "所属長級": return "bg-orange-300";
    case "課長級": return "bg-yellow-300";
    case "補佐級III(補佐兼班長)": return "bg-sky-300";
    case "補佐級II(班長)": return "bg-emerald-300";
    case "補佐級I(主任)": return "bg-pink-300";
    case "係長級(主査)": return "bg-slate-300";
    case "一般": return "bg-indigo-200";
    default: return "";
  }
};

export const getPromotedBorderClass = (grade) => {
  switch (grade) {
    case "部長級": return "border-purple-400";
    case "次長級": return "border-red-400";
    case "所属長級": return "border-orange-400";
    case "課長級": return "border-yellow-400";
    case "補佐級III(補佐兼班長)": return "border-sky-400";
    case "補佐級II(班長)": return "border-emerald-400";
    case "補佐級I(主任)": return "border-pink-400";
    case "係長級(主査)": return "border-slate-400";
    case "一般": return "border-indigo-300";
    default: return "border-slate-300";
  }
};`;

let replaced = false;
if (content.includes(t)) {
  content = content.replace(t, r);
  replaced = true;
} else if (content.includes(t.replace(/\n/g, '\r\n'))) {
  content = content.replace(t.replace(/\n/g, '\r\n'), r.replace(/\n/g, '\r\n'));
  replaced = true;
}

if (!replaced) {
  console.log('Failed to patch helpers.js');
  process.exit(1);
}

fs.writeFileSync('src/utils/helpers.js', content);
console.log('Successfully patched helpers.js');
