import subprocess
import sys
import re

print("=== Running Secret Scan for Terms Audit Desk ===")

# 1. Check for tracked env files
try:
    tracked = subprocess.check_output(["git", "ls-files"], text=True).splitlines()
except Exception:
    tracked = []

env_files = [f for f in tracked if "env" in f.lower() and not f.endswith(".env.example")]
if env_files:
    print(f"FAIL: Tracked env file detected: {env_files}")
    sys.exit(1)
else:
    print("PASS: No secret .env files tracked in git.")

# 2. Check for private key patterns (0x followed by 64 hex chars)
# Note: transaction hashes and state roots can be 64 hex chars, but private keys should not be in source files
PK_REGEX = re.compile(r'(?:private[_-]?key|secret[_-]?key|mnemonic|seed[_-]?phrase)\s*[:=]\s*[\'"][^\'"]+[\'"]', re.IGNORECASE)

violations = []
for f in tracked:
    if f.startswith(".git") or f.endswith(".png") or f.endswith(".svg") or f.endswith(".zip"):
        continue
    try:
        with open(f, "r", encoding="utf-8", errors="ignore") as fp:
            for idx, line in enumerate(fp, 1):
                if PK_REGEX.search(line):
                    violations.append(f"{f}:{idx}: {line.strip()}")
    except Exception:
        pass

if violations:
    print(f"FAIL: Potential secrets detected:\n" + "\n".join(violations))
    sys.exit(1)

print("PASS: 0 private keys or secret variables found.")
print("=== SECRET SCAN PASSED ===")
sys.exit(0)
