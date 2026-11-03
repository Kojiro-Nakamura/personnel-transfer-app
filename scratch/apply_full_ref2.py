import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # 1. ws.columns array
    if "ws.columns = [" in line and "A 部署名" in lines[i+1]:
        new_lines.append(line)
        while "];" not in lines[i]:
            i += 1
            if "];" not in lines[i]:
                new_lines.append(lines[i])
        
        # We are at `];`
        # Append the extraCols setup before ws.columns? No, wait. 
        # Actually I can just insert extraCols above `ws.columns = [` !
        pass
        
    i += 1