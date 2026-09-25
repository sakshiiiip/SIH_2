import os, re

keys = [
    "addSkill.charsCount",
    "addSkill.subtitle",
    "addSkill.successMsg",
    "worker.breakPicker.confirmBtn",
    "worker.breakPicker.durationBtn",
    "worker.community.enrolledMsg",
    "worker.community.messagePlaceholder",
    "worker.community.noMessages",
    "worker.dashboard.breakStartedMsg",
    "worker.dashboard.distanceLabel",
    "worker.earnings.jobsCompletedCount",
    "worker.earnings.pendingJobsCount",
    "worker.earnings.showAllPayments",
    "worker.jobExec.completedSettlement",
    "worker.jobs.cancelledBy",
    "worker.jobs.paymentPending",
    "worker.notifications.newCount",
    "worker.onboarding.tier2Docs",
    "worker.onboarding.tier5Docs",
    "worker.photoTile.recorded",
    "worker.photoTile.retakeChangeLabel",
    "worker.photoTile.takeUploadLabel",
    "worker.profile.verifMembershipDesc",
    "worker.startBreak",
    "worker.toolBank.activeLoans",
    "worker.toolBank.checkoutSuccessMsg",
    "worker.toolBank.returnSuccessMsg",
    "worker.toolBank.unavailable",
]

files = []
for root, _, filenames in os.walk('src'):
    for f in filenames:
        if f.endswith(('.ts', '.tsx')):
            files.append(os.path.join(root, f))

found = {}
for file_path in files:
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    for k in keys:
        if k in content:
            lines = [line.strip() for line in content.split('\n') if k in line]
            found.setdefault(k, []).extend(lines)

for k in keys:
    print(f"=== {k} ===")
    for l in found.get(k, ['NOT FOUND']):
        print(" ", l)
