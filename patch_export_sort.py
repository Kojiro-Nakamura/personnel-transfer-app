import sys

with open('src/utils/exportHtml.js', 'r', encoding='utf-8') as f:
    text = f.read()

target1 = '''        switching = true;
        dir = "asc";'''
repl1 = '''        switching = true;
        dir = "desc";'''

target2 = '''          } else {
            if (switchcount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
            }
          }'''
repl2 = '''          } else {
            if (switchcount == 0 && dir == "desc") {
              dir = "asc";
              switching = true;
            }
          }'''

if target1 in text and target2 in text:
    text = text.replace(target1, repl1)
    text = text.replace(target2, repl2)
    with open('src/utils/exportHtml.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Patch applied to exportHtml.js")
else:
    print("Target not found")
