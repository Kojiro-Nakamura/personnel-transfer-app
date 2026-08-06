import fs from 'fs';

// Patch App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');
const tApp = `                <div className="flex-1 p-2 text-center border-r bg-slate-200/50 flex flex-col justify-center">
                  <div>今年度（現行）</div>
                  <div className="text-[10px] font-normal text-slate-900 mt-0.5">{currentSummary}</div>
                </div>
                <div className="flex-1 p-2 text-[#065084] text-center bg-blue-100/50 flex flex-col justify-center">
                  <div>来年度（新組織）</div>
                  <div className="text-[10px] font-normal text-blue-950 mt-0.5">{nextSummary}</div>
                </div>`;
const rApp = `                <div className="flex-1 p-2 text-center border-r bg-slate-200/50 flex flex-col justify-center">
                  <div>今年度（現行）{getEraFormattedYear(targetYear - 1)}</div>
                  <div className="text-[10px] font-normal text-slate-900 mt-0.5">{currentSummary}</div>
                </div>
                <div className="flex-1 p-2 text-[#065084] text-center bg-blue-100/50 flex flex-col justify-center">
                  <div>来年度（新組織）{getEraFormattedYear(targetYear)}</div>
                  <div className="text-[10px] font-normal text-blue-950 mt-0.5">{nextSummary}</div>
                </div>`;
let appReplaced = false;
if (appContent.includes(tApp)) {
  appContent = appContent.replace(tApp, rApp);
  appReplaced = true;
} else if (appContent.includes(tApp.replace(/\n/g, '\r\n'))) {
  appContent = appContent.replace(tApp.replace(/\n/g, '\r\n'), rApp.replace(/\n/g, '\r\n'));
  appReplaced = true;
}
if (!appReplaced) {
  console.log("Failed to patch App.jsx");
  process.exit(1);
}
fs.writeFileSync('src/App.jsx', appContent);


// Patch exportHtml.js
let htmlContent = fs.readFileSync('src/utils/exportHtml.js', 'utf8');
const tHtml1 = `      <th colspan="7" class="bg-slate">今年度</th>
      <th colspan="7" class="bg-blue">来年度</th>`;
const rHtml1 = `      <th colspan="7" class="bg-slate">今年度（現行）\${getEraFormattedYear(targetYear - 1)}</th>
      <th colspan="7" class="bg-blue">来年度（新組織）\${getEraFormattedYear(targetYear)}</th>`;

let htmlReplaced = false;
if (htmlContent.includes(tHtml1)) {
  htmlContent = htmlContent.replace(tHtml1, rHtml1);
  htmlReplaced = true;
} else if (htmlContent.includes(tHtml1.replace(/\n/g, '\r\n'))) {
  htmlContent = htmlContent.replace(tHtml1.replace(/\n/g, '\r\n'), rHtml1.replace(/\n/g, '\r\n'));
  htmlReplaced = true;
}
if (!htmlReplaced) {
  console.log("Failed to patch exportHtml.js (headers)");
  process.exit(1);
}

const tHtml2 = `      <th onclick="sortTable(30)" class="bg-fuchsia" style="width: 56px;">来年度</th>`;
const rHtml2 = `      <th onclick="sortTable(30)" class="bg-fuchsia" style="width: 56px;">来年度<br>\${getEraFormattedYear(targetYear)}</th>`;

if (htmlContent.includes(tHtml2)) {
  htmlContent = htmlContent.replace(tHtml2, rHtml2);
} else if (htmlContent.includes(tHtml2.replace(/\n/g, '\r\n'))) {
  htmlContent = htmlContent.replace(tHtml2.replace(/\n/g, '\r\n'), rHtml2.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/utils/exportHtml.js', htmlContent);

console.log("Patched App.jsx and exportHtml.js for year titles");
