import json
import os

local_file = '../data/channels.json'

new_channel = {
    "name": "PTV",
    "group": "world cup hub",
    "url": "https://proxy.futuredesh.com/api/proxy?url=http://103.165.93.31:8095/ptv/tracks-v1a1/mono.m3u8",
    "useNativeVideo": True
}

try:
    with open(local_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    data.append(new_channel)
    
    with open(local_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print("Successfully added PTV to channels.json")
except Exception as e:
    print(f"Error: {e}")
