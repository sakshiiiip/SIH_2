import json, re

raw = json.load(open('scripts/locales_data/worker_raw.json'))

part1_keys = [k for k in raw.keys() if k.startswith(('addSkill.', 'jobStatus.', 'worker.dashboard.', 'worker.jobs.', 'worker.jobExec.', 'worker.break', 'worker.notifications.', 'worker.photoTile.', 'worker.stepLabels.', 'worker.work.')) or k in ('worker.acceptJob', 'worker.processing', 'worker.startBreak', 'worker.resumeWork', 'worker.priorityEmergency', 'worker.priorityUrgent', 'worker.jobRequest')]

with open('scripts/generate_worker_part1.py') as f:
    content = f.read()

already_translated = set(re.findall(r'"([^"]+)": \(', content))

missing = set(part1_keys) - already_translated
print('Missing in part1 count:', len(missing))
missing_dict = {k: raw[k] for k in sorted(missing)}
with open('/tmp/part1_missing.json', 'w', encoding='utf-8') as f:
    json.dump(missing_dict, f, indent=2, ensure_ascii=False)
print("Dumped to /tmp/part1_missing.json")
