import urllib.request
import json
import os

url = "http://ssrv88.com:80/player_api.php?username=7897442120&password=8964203798&action=get_live_streams"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
output_file = r"e:\Web Development Journey\Day 92 - IPTV\IPTV\data\ssrv88_channels.json"

try:
    print("Fetching channels...")
    resp = urllib.request.urlopen(req, timeout=30)
    data = resp.read().decode('utf-8', errors='ignore')
    channels = json.loads(data)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(channels, f, indent=4)
        
    print(f"Successfully saved {len(channels)} channels to {output_file}")
except Exception as e:
    print(f"Error: {e}")
