import urllib.request
import json

url = "http://ssrv88.com:80/player_api.php?username=7897442120&password=8964203798&action=get_live_streams"
vod_url = "http://ssrv88.com:80/player_api.php?username=7897442120&password=8964203798&action=get_vod_streams"
series_url = "http://ssrv88.com:80/player_api.php?username=7897442120&password=8964203798&action=get_series"

def check_endpoint(name, endpoint):
    req = urllib.request.Request(endpoint, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        data = resp.read().decode('utf-8', errors='ignore')
        items = json.loads(data)
        if isinstance(items, list):
            print(f"Total {name}: {len(items)}")
        else:
            print(f"Total {name}: Error (Unexpected format)")
    except Exception as e:
        print(f"Total {name}: Error ({e})")

print("Checking ssrv88.com...")
check_endpoint("Live Channels", url)
check_endpoint("VOD Movies", vod_url)
check_endpoint("TV Series", series_url)
