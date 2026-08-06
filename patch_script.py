import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''        } else {
          if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
          }
        }
      }
    }
  `;'''

repl = '''        } else {
          if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
          }
        }
      }
    }

    document.addEventListener("DOMContentLoaded", function() {
      var nameCol = document.querySelector("th.sticky-name");
      if (nameCol) {
        var w = nameCol.getBoundingClientRect().width;
        var style = document.createElement("style");
        style.innerHTML = ".sticky-age { left: " + w + "px !important; }";
        document.head.appendChild(style);
      }
    });
  `;'''

if target in text:
    text = text.replace(target, repl)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Script appended successfully")
else:
    print("Target block not found")
