import json

data = json.load(open('scripts/locales_data/worker_raw.json'))
for k, v in sorted(data.items()):
    if '${' in v:
        print(f"{k} ::: {v}")
