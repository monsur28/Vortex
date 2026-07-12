import json
import urllib.request
import os

local_file = '../data/channels.json'
url = 'https://iamshajon.com/playlist/fifa.json'

try:
    with open(local_file, 'r', encoding='utf-8') as f:
        local_data = json.load(f)
    
    local_urls = {item.get('url') for item in local_data if item.get('url')}
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        remote_data = json.loads(response.read().decode())
    
    remote_urls = {item.get('url') for item in remote_data if item.get('url')}
    
    new_urls = remote_urls - local_urls
    
    new_items = [item for item in remote_data if item.get('url') in new_urls]
    
    if new_items:
        print(f"Adding {len(new_items)} new channels to channels.json...")
        local_data.extend(new_items)
        
        with open(local_file, 'w', encoding='utf-8') as f:
            json.dump(local_data, f, indent=4, ensure_ascii=False)
            
        print("Update successful!")
    else:
        print("No new channels to add.")
        
except Exception as e:
    print(f"Error: {e}")
