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
    
    print(f"Total local channels: {len(local_urls)}")
    print(f"Total remote channels: {len(remote_urls)}")
    print(f"New channels found in remote that are not in local: {len(new_items)}")
    
    if new_items:
        print("\nSome of the new channels:")
        for item in new_items[:10]:
            print(f"- {item.get('name')} | Group: {item.get('group')} | URL: {item.get('url')}")
            
except Exception as e:
    print(f"Error: {e}")
