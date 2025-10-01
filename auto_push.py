import os
import subprocess
from datetime import datetime

# Ton répertoire local
repo_path = r"E:\RG\chart-guru-prime-29"

# Message de commit automatique avec timestamp
commit_message = f"Auto-update {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

# Étapes Git : pull -> add -> commit -> push
commands = [
    ["git", "-C", repo_path, "pull"],
    ["git", "-C", repo_path, "add", "."],
    ["git", "-C", repo_path, "commit", "-m", commit_message],
    ["git", "-C", repo_path, "push"]
]

for cmd in commands:
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError:
        print(f"Erreur avec la commande : {' '.join(cmd)}")
        break
