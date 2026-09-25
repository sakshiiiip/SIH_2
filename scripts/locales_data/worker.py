# Unified Worker translations combining Part 1, Part 2, and Part 3
from .worker_part1 import DATA as part1
from .worker_part2 import DATA as part2
from .worker_part3 import DATA as part3

DATA = {}
DATA.update(part1)
DATA.update(part2)
DATA.update(part3)
