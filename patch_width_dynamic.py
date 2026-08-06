import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. CSS update for .sticky-name
css_target = '''  /* Sticky name column */
  .sticky-name { position: sticky; left: 0; font-weight: bold; min-width: 90px; width: 90px; box-sizing: border-box; }'''

css_repl = '''  /* Sticky name column */
  .sticky-name { position: sticky; left: 0; font-weight: bold; max-width: 90px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }'''

if css_target in text:
    text = text.replace(css_target, css_repl)
    print("CSS replaced")
else:
    print("CSS target not found")

# 2. Append script to scriptStr
script_target = '''        if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          switchcount ++;
        } else {
          if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
          }
        }
      }
    }'''

script_repl = '''        if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          switchcount ++;
        } else {
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
    });'''

if script_target in text:
    text = text.replace(script_target, script_repl)
    print("Script replaced")
else:
    print("Script target not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
