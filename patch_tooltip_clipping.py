import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update sortedEmps.map
content = content.replace('{sortedEmps.map(emp => {', '{sortedEmps.map((emp, empIdx) => {')

# 2. Update historyYears.map block
target_hist_map = '''                    {historyYears.length > 0 && historyYears.map(year => {
                      let histStr = '';
                      if (year === targetYear) {'''

repl_hist_map = '''                    {historyYears.length > 0 && historyYears.map((year, yIdx) => {
                      let histStr = '';
                      if (year === targetYear) {'''

content = content.replace(target_hist_map, repl_hist_map)

# 3. Update the tooltip inside the history map
target_tooltip = '''                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px] relative group/hist">
                          <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center cursor-default"} title="" />
                          {histStr && (
                            <div className="absolute hidden group-hover/hist:block z-[999] bg-slate-800 text-white text-[11px] rounded py-1 px-2 top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap shadow-xl pointer-events-none">
                              {histStr}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                            </div>
                          )}
                        </td>
                      );'''

repl_tooltip = '''                      const isBottom = empIdx >= sortedEmps.length - 2;
                      const isRight = yIdx >= historyYears.length - 2;
                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px] relative group/hist">
                          <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center cursor-default"} title="" />
                          {histStr && (
                            <div className={cx(
                                "absolute hidden group-hover/hist:block z-[999] bg-slate-800 text-white text-[11px] rounded py-1 px-2 whitespace-nowrap shadow-xl pointer-events-none",
                                isBottom ? "bottom-full mb-1" : "top-full mt-1",
                                isRight ? "right-0" : "left-1/2 -translate-x-1/2"
                            )}>
                              {histStr}
                              <div className={cx(
                                "absolute border-4 border-transparent",
                                isBottom ? "top-full border-t-slate-800" : "bottom-full border-b-slate-800",
                                isRight ? "right-4" : "left-1/2 -translate-x-1/2"
                              )}></div>
                            </div>
                          )}
                        </td>
                      );'''

content = content.replace(target_tooltip, repl_tooltip)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS patched tooltip clipping")
