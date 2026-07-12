import json
import os

local_file = '../data/channels.json'

try:
    with open(local_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Find TSN 4 and update its url and useProxy
    for item in data:
        if item.get('name') == 'TSN 4' and item.get('group') == 'world cup hub':
            # Use the proxy URL to avoid Mixed Content over HTTPS
            item['url'] = 'https://proxy.futuredesh.com/api/proxy?url=http%3A%2F%2F213.152.185.148%2Ftsn4%2Ftracks-v1a1%2Fmono.ts.m3u8'
            item['useProxy'] = False # the URL itself is already a proxy
            break
            
    with open(local_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print("Successfully updated TSN 4 to use the HTTPS proxy link.")
except Exception as e:
    print(f"Error: {e}")
