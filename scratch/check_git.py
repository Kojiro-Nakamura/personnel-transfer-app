import subprocess

out = subprocess.check_output(["git", "show", "HEAD~1:src/utils/exportExcel.js"], encoding="utf8")
lines = out.split("\n")
for j, line in enumerate(lines):
    if "legendEndCol" in line:
        print(f"{j+1}: {line.rstrip()}")