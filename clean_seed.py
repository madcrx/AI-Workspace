import re

# Read the seed file
with open(r'C:\Users\brett\Documents\Claude Code\prisma\seed.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the realAITools array start
start_idx = None
for i, line in enumerate(lines):
    if 'const realAITools = [' in line:
        start_idx = i + 1
        break

# Find the end of the array
end_idx = None
for i in range(start_idx, len(lines)):
    if lines[i].strip() == '];':
        end_idx = i
        break

# Extract tool entries
current_tool_lines = []
all_tools = []
seen_slugs = set()

for i in range(start_idx, end_idx):
    line = lines[i]
    current_tool_lines.append(line)

    # Check if this is the end of a tool entry
    if line.strip() == '},':
        # Extract the slug from this tool entry
        tool_text = ''.join(current_tool_lines)
        slug_match = re.search(r"slug:\s*['\"]([^'\"]+)['\"]", tool_text)

        if slug_match:
            slug = slug_match.group(1)
            # Only keep if we haven't seen this slug before
            if slug not in seen_slugs:
                seen_slugs.add(slug)
                all_tools.append(current_tool_lines[:])
            else:
                print(f"Removing duplicate: {slug}")

        current_tool_lines = []

# Rebuild the file
output_lines = lines[:start_idx]

# Add unique tools
for tool_lines in all_tools:
    output_lines.extend(tool_lines)

# Add the rest of the file
output_lines.extend(lines[end_idx:])

# Write back
with open(r'C:\Users\brett\Documents\Claude Code\prisma\seed.ts', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print(f"\nCleaned up seed file")
print(f"Unique tools kept: {len(all_tools)}")
print(f"Duplicates removed: {len(seen_slugs) - len(all_tools) if len(seen_slugs) > len(all_tools) else 0}")
