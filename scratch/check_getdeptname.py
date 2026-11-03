import os
for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith(".js") or file.endswith(".jsx"):
            with open(os.path.join(root, file), "r", encoding="utf8") as f:
                content = f.read()
                if "getDeptName" in content:
                    print(file)