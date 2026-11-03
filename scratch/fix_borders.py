import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    func_code = code[start:]
    pre_code = code[:start]

    # Remove the empty group/post row that prints when filteredEmps.length === 0
    old_empty = """      if (filteredEmps.length === 0) {
        return; // 不要な空白行を挿入しない
        const row = ws.getRow(currentRowIndex);"""
    
    new_empty = """      if (filteredEmps.length === 0) {
        return; // 不要な空白行を挿入しない"""
    
    # We should actually just replace the whole block because there's a loop inside that we don't need anymore.
    # Wait, in the earlier run I already changed it to `return;`! So the loop below it is unreachable!
    # But it's better to remove the unreachable code.
    pass
