import urllib.request
import urllib.parse
import json

print("Testing M3U URLs...")
m3us = ["https://is.gd/ldaJYd.m3u", "https://is.gd/y8E2YD.m3u"]
for url in m3us:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        print(f"{url}: ALIVE (HTTP {resp.getcode()}) -> Resolved to: {resp.geturl()}")
    except Exception as e:
        print(f"{url}: DEAD ({e})")

print("\nTesting Xtream Servers...")
xtream = [
    ("http://86.107.179.250:80", "vuralde", "fWrkKx956j"),
    ("http://antman1.giize.com", "valeri1.", "T9KJ65fzceats"),
    ("http://s.rocketdns.info:8080", "monstercable", "Dq6jjknxCr"),
    ("http://ssrv88.com:80", "7897442120", "8964203798")
]

for server, user, password in xtream:
    url = f"{server}/player_api.php?username={urllib.parse.quote(user)}&password={urllib.parse.quote(password)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        data = resp.read().decode('utf-8', errors='ignore')
        try:
            j = json.loads(data)
            if 'user_info' in j:
                status = j['user_info'].get('status', 'unknown')
                auth = j['user_info'].get('auth', 1)
                active = j['user_info'].get('active_cons', 0)
                max_cons = j['user_info'].get('max_connections', 0)
                print(f"{server} (User: {user}): ALIVE (Status: {status}, Active: {active}/{max_cons})")
            else:
                print(f"{server} (User: {user}): FAILED (Invalid JSON response)")
        except:
            print(f"{server} (User: {user}): FAILED (Not JSON)")
    except Exception as e:
        print(f"{server} (User: {user}): DEAD ({e})")

print("\nTesting STALKER Servers (Basic Reachability)...")
stalkers = [
    ("http://204.52.191.254:80", "00:1A:79:C9:A4:81"),
    ("http://line.linehunt.org:8000", "A0:BB:3E:64:68:E3")
]
for server, mac in stalkers:
    # Just basic reachability check for Stalker (needs specific headers/handshake for full test)
    url = f"{server}/c/"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        print(f"{server} (MAC: {mac}): REACHABLE (HTTP {resp.getcode()})")
    except urllib.error.HTTPError as e:
        print(f"{server} (MAC: {mac}): HTTP Error {e.code} (Might work with STB emulator)")
    except Exception as e:
        print(f"{server} (MAC: {mac}): DEAD ({e})")
