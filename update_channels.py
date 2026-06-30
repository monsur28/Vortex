import json
import codecs

# Read the file with UTF-16-LE encoding
with codecs.open('e:\\Web Development Journey\\Day 92 - IPTV\\IPTV\\fetch_fifa_new.html', 'r', encoding='utf-16le') as f:
    data = f.read()

channels_path = 'e:\\Web Development Journey\\Day 92 - IPTV\\IPTV\\data\\channels.json'
with open(channels_path, 'r', encoding='utf-8') as f:
    existing_channels = json.load(f)

# Keep track of existing urls to avoid duplicates
existing_urls = set([c.get('url', '') for c in existing_channels])

current = {}
added_count = 0
for line in data.split('\n'):
    line = line.strip()
    if line.startswith('#EXTINF:'):
        current['name'] = line.split(',')[-1].strip()
        current['group'] = 'FIFA World Cup 2026'
        current['logo'] = "https://image.tsports.com/images/mobile_thumbnail/1761718928-1750064430-LIVE.jpg"
        current['useProxy'] = True
        current['proxySegments'] = True
    elif line and not line.startswith('#'):
        current['url'] = line
        
        if current['url'] not in existing_urls:
            existing_channels.append(current)
            existing_urls.add(current['url'])
            added_count += 1
            print(f"Added {current['name']}")
        else:
            print(f"Skipped {current['name']} (already exists)")
        
        current = {}

if added_count > 0:
    with open(channels_path, 'w', encoding='utf-8') as f:
        json.dump(existing_channels, f, indent=4)
    print(f"Successfully added {added_count} new channels to channels.json")
else:
    print("No new channels added.")
