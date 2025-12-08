import re

# Read the seed file
with open(r'C:\Users\brett\Documents\Claude Code\prisma\seed.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all tools
tools_pattern = r'\{\s*name:\s*[\'"]([^\'"]+)[\'"]\s*,\s*slug:\s*[\'"]([^\'"]+)[\'"]\s*,\s*description:[^\}]*\}'
tools = re.findall(tools_pattern, content, re.DOTALL)

# Track seen slugs and their first occurrence
seen_slugs = {}
duplicate_slugs = []

for name, slug in tools:
    if slug in seen_slugs:
        duplicate_slugs.append(slug)
        print(f"Duplicate found: {slug} ({name}) - original: {seen_slugs[slug]}")
    else:
        seen_slugs[slug] = name

print(f"\nTotal tools: {len(tools)}")
print(f"Unique tools: {len(seen_slugs)}")
print(f"Duplicates: {len(duplicate_slugs)}")
