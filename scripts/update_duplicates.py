import urllib.request, json, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request('https://iamshajon.com/playlist/fifa.json', headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req, context=ctx)
data = json.loads(res.read().decode('utf-8'))
remote_channels = data if isinstance(data, list) else data.get('channels', [])

with open('e:/Web Development Journey/Day 92 - IPTV/IPTV/data/channels.json', 'r', encoding='utf-8') as f:
    local_channels = json.load(f)

updated_count = 0
for rc in remote_channels:
    for lc in local_channels:
        if lc.get('name') == rc.get('name'):
            if lc.get('url') != rc.get('url'):
                lc['url'] = rc.get('url')
                if 'headers' in rc:
                    lc['headers'] = rc['headers']
                if 'drm' in rc:
                    lc['drm'] = rc['drm']
                elif 'drm' in lc:
                    del lc['drm']
                updated_count += 1
                print(f"Updated link for {lc.get('name')}")
            break

with open('e:/Web Development Journey/Day 92 - IPTV/IPTV/data/channels.json', 'w', encoding='utf-8') as f:
    json.dump(local_channels, f, indent=4, ensure_ascii=False)
print(f'Updated {updated_count} existing channels.')
