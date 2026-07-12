import urllib.request
import json
import ssl
import sys
import time

def check_url(url, headers=None):
    if not url:
        return False, "No URL"
    
    # Create an unverified SSL context to avoid certificate errors
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, method='HEAD')
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)

    try:
        response = urllib.request.urlopen(req, context=ctx, timeout=5)
        if response.status == 200 or response.status == 206:
            return True, f"{response.status} OK"
        return False, f"HTTP {response.status}"
    except urllib.error.HTTPError as e:
        # Some servers don't like HEAD, try GET with a range header
        if e.code in [403, 404, 405, 500, 502, 503]:
             try:
                req = urllib.request.Request(url, method='GET')
                req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
                req.add_header('Range', 'bytes=0-100')
                if headers:
                    for k, v in headers.items():
                        req.add_header(k, v)
                resp = urllib.request.urlopen(req, context=ctx, timeout=5)
                return True, f"{resp.status} OK (GET)"
             except Exception as get_e:
                 return False, f"HTTP {e.code} (HEAD), then {get_e} (GET)"
        return False, f"HTTP {e.code}"
    except Exception as e:
        return False, str(e)

def main():
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    json_url = 'https://iamshajon.com/playlist/fifa.json'
    print(f"Fetching JSON from {json_url}...")
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        req = urllib.request.Request(json_url)
        req.add_header('User-Agent', 'Mozilla/5.0')
        response = urllib.request.urlopen(req, context=ctx, timeout=10)
        data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching JSON: {e}")
        return

    channels = data if isinstance(data, list) else data.get('channels', [])
    
    print(f"Found {len(channels)} channels. Checking...")
    print("-" * 60)
    
    working = []
    broken = []

    for idx, ch in enumerate(channels):
        name = ch.get('name', f'Channel {idx+1}')
        url = ch.get('url', '')
        headers = ch.get('headers', {})
        
        print(f"[{idx+1}/{len(channels)}] Checking '{name}'...")
        is_working, msg = check_url(url, headers)
        
        if is_working:
            print(f"  [OK] {msg}")
            working.append(name)
        else:
            print(f"  [ERROR] {msg}")
            broken.append({'name': name, 'msg': msg})
            
        time.sleep(0.5)

    print("-" * 60)
    print(f"Summary: {len(working)} working, {len(broken)} broken")
    if broken:
        print("\nBroken Channels:")
        for b in broken:
            print(f" - {b['name']}: {b['msg']}")

if __name__ == '__main__':
    main()
