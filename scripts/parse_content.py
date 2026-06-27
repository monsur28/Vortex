import re

with open(r'C:\Users\monsu\.gemini\antigravity-ide\brain\813a8588-24bc-4d0a-a76d-b6b3e0b289f4\.system_generated\steps\20\content.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract the channels part if it's there
# Looking at the script tag at the end, it might have json or array of channels
import json

# Try to find something that looks like an array or .json or .m3u
links = re.findall(r'https?://[^\s"\'<>]+', content)
print("Links found:")
for link in set(links):
    if 'm3u' in link or 'json' in link or 'channel' in link or 'api' in link or 'php' in link:
        print(link)

# Print the last 1000 chars of the file to see what it is
print("\nEnd of file:")
print(content[-1000:])
