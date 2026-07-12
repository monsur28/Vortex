import json
import os

local_file = '../data/channels.json'

new_channel = {
    "name": "TSN 4",
    "group": "world cup hub",
    "url": "http://213.152.185.148/tsn4/tracks-v1a1/mono.ts.m3u8",
    "useNativeVideo": True
}

try:
    with open(local_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data.append(new_channel)
    
    with open(local_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print("Successfully added TSN 4 to channels.json")
except Exception as e:
    print(f"Error: {e}")
