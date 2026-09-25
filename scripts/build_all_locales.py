import sys, os
sys.path.insert(0, os.path.abspath('.'))

import json
from scripts.locales_data.common_auth import DATA as d1
from scripts.locales_data.customer import DATA as d2
from scripts.locales_data.admin_support import DATA as d3
from scripts.locales_data.worker import DATA as d4

total = {}
total.update(d1)
total.update(d2)
total.update(d3)
total.update(d4)

print(f"Total unique keys to export: {len(total)}")

en_dict = {}
hi_dict = {}

for k in sorted(total.keys()):
    en_val, hi_val = total[k]
    en_dict[k] = en_val
    hi_dict[k] = hi_val

# Write src/locales/en.ts
with open('src/locales/en.ts', 'w', encoding='utf-8') as f:
    f.write("// English translations (Total: %d keys)\n" % len(en_dict))
    f.write("export const en: Record<string, string> = ")
    json.dump(en_dict, f, indent=2, ensure_ascii=False)
    f.write(";\n")

# Write src/locales/hi.ts
with open('src/locales/hi.ts', 'w', encoding='utf-8') as f:
    f.write("// Hindi translations (Total: %d keys)\n" % len(hi_dict))
    f.write("export const hi: Record<string, string> = ")
    json.dump(hi_dict, f, indent=2, ensure_ascii=False)
    f.write(";\n")

print("Successfully generated src/locales/en.ts and src/locales/hi.ts!")
