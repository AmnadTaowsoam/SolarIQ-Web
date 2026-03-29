"""
Scan all .tsx files in src/ for useTranslations() calls,
extract t('key') usages, and check against messages/th.json.
"""

import json
import os
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(r"D:/SolarIQ-Application/SolarIQ-Web")
SRC = ROOT / "src"
TH_JSON = ROOT / "messages" / "th.json"
EN_JSON = ROOT / "messages" / "en.json"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def resolve_namespace(data, namespace):
    """
    Resolve a dotted namespace like 'authPages.login' into the
    nested dict within the JSON.  Returns None if not found.
    """
    parts = namespace.split(".")
    node = data
    for p in parts:
        if isinstance(node, dict) and p in node:
            node = node[p]
        else:
            return None
    return node


def key_exists(ns_data, key):
    """
    Check if a dotted key like 'inputForm.title' exists
    within the namespace data dict.
    """
    parts = key.split(".")
    node = ns_data
    for p in parts:
        if isinstance(node, dict) and p in node:
            node = node[p]
        else:
            return False
    return True


def scan_file(filepath):
    """
    Return list of (variable_name, namespace) pairs for useTranslations calls,
    and list of (variable_name, key) pairs for t('key') calls.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all useTranslations assignments
    # Patterns:
    #   const t = useTranslations('namespace')
    #   const tFoo = useTranslations('namespace')
    #   useTranslations('namespace')  (no assignment - rare)
    ns_pattern = re.compile(
        r"""(?:const\s+(\w+)\s*=\s*)?useTranslations\(\s*['"]([^'"]+)['"]\s*\)""",
    )

    assignments = []  # (var_name, namespace)
    for m in ns_pattern.finditer(content):
        var_name = m.group(1) or "t"
        namespace = m.group(2)
        assignments.append((var_name, namespace))

    # For each variable, find all calls like varName('key') or varName('key', ...)
    # We need to be careful to match the variable name followed by ('...')
    keys_used = []  # (namespace, key)
    for var_name, namespace in assignments:
        # Escape var_name for regex; match var('key'...) or var("key"...)
        # Also handle var(`key`) template literals (rare but possible)
        key_pattern = re.compile(
            rf"""\b{re.escape(var_name)}\(\s*['"]([^'"]+)['"]"""
        )
        for m in key_pattern.finditer(content):
            key = m.group(1)
            keys_used.append((namespace, key))

    return keys_used


def flatten_keys(data, prefix=""):
    """Flatten a nested dict into dotted key paths."""
    keys = set()
    if isinstance(data, dict):
        for k, v in data.items():
            full = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys.update(flatten_keys(v, full))
            else:
                keys.add(full)
    return keys


def main():
    th_data = load_json(TH_JSON)
    en_data = load_json(EN_JSON)

    # Collect all (namespace, key) pairs from all tsx files
    all_usages = []  # (filepath, namespace, key)
    tsx_files = list(SRC.rglob("*.tsx"))
    print(f"Scanning {len(tsx_files)} .tsx files...\n")

    for fpath in tsx_files:
        keys_used = scan_file(fpath)
        for ns, key in keys_used:
            all_usages.append((str(fpath), ns, key))

    # Deduplicate namespace.key pairs
    unique_ns_keys = sorted(set((ns, key) for _, ns, key in all_usages))

    # Check against th.json
    missing_in_th = []
    missing_in_en = []

    for ns, key in unique_ns_keys:
        ns_data_th = resolve_namespace(th_data, ns)
        ns_data_en = resolve_namespace(en_data, ns)

        if ns_data_th is None:
            missing_in_th.append((ns, key, "NAMESPACE_MISSING"))
        elif not key_exists(ns_data_th, key):
            missing_in_th.append((ns, key, "KEY_MISSING"))

        if ns_data_en is None:
            missing_in_en.append((ns, key, "NAMESPACE_MISSING"))
        elif not key_exists(ns_data_en, key):
            missing_in_en.append((ns, key, "KEY_MISSING"))

    # Report
    print(f"Total unique namespace.key pairs used in code: {len(unique_ns_keys)}")
    print(f"Missing in th.json: {len(missing_in_th)}")
    print(f"Missing in en.json: {len(missing_in_en)}")

    print("\n" + "=" * 60)
    print("MISSING IN th.json:")
    print("=" * 60)
    for ns, key, reason in sorted(missing_in_th):
        print(f"  {ns}.{key}  ({reason})")

    if missing_in_en:
        print("\n" + "=" * 60)
        print("MISSING IN en.json:")
        print("=" * 60)
        for ns, key, reason in sorted(missing_in_en):
            print(f"  {ns}.{key}  ({reason})")

    # Specific checks requested by user
    print("\n" + "=" * 60)
    print("SPECIFIC KEY CHECKS (th.json):")
    print("=" * 60)
    specific_keys = [
        ("settingsPage", "tabs.privacy"),
        ("analyzePage", "title"),
        ("analyzePage", "inputForm.title"),
        ("analyzePage", "inputForm"),
    ]
    for ns, key in specific_keys:
        ns_data = resolve_namespace(th_data, ns)
        if ns_data is None:
            status = "NAMESPACE MISSING"
        elif key_exists(ns_data, key):
            status = "EXISTS"
        else:
            status = "MISSING"
        print(f"  {ns}.{key}: {status}")

    # Also show all analyzePage.inputForm.* keys used in code
    print("\n" + "=" * 60)
    print("ALL analyzePage.inputForm.* keys used in code:")
    print("=" * 60)
    for ns, key in unique_ns_keys:
        if ns == "analyzePage" and key.startswith("inputForm"):
            ns_data = resolve_namespace(th_data, ns)
            exists = key_exists(ns_data, key) if ns_data else False
            print(f"  analyzePage.{key}: {'EXISTS' if exists else 'MISSING'}")

    # Show which files use each missing namespace
    print("\n" + "=" * 60)
    print("FILES USING MISSING NAMESPACES/KEYS (th.json):")
    print("=" * 60)
    missing_set = set((ns, key) for ns, key, _ in missing_in_th)
    files_per_missing = defaultdict(set)
    for fpath, ns, key in all_usages:
        if (ns, key) in missing_set:
            rel = os.path.relpath(fpath, ROOT)
            files_per_missing[(ns, key)].add(rel)

    for (ns, key), files in sorted(files_per_missing.items()):
        print(f"  {ns}.{key}:")
        for f in sorted(files):
            print(f"    -> {f}")


if __name__ == "__main__":
    main()
