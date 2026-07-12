import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
url = 'https://circlesports.best/auto-start.php?id=5'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    res = urllib.request.urlopen(req, context=ctx, timeout=15)
    html = res.read().decode('utf-8', errors='ignore')
    
    m = re.search(r"source:\s*['\"]([^'\"]+)['\"]", html)
    if m:
        print('Source:', m.group(1))
    else: 
        m2 = re.search(r"file:\s*['\"]([^'\"]+)['\"]", html)
        if m2:
            print('File:', m2.group(1))
        else:
            streams = re.findall(r'https?://[^\s\"\'<>]+(?:\.m3u8|\.mpd)[^\s\"\'<>]*', html)
            if streams:
                print('Streams found:', list(set(streams)))
            else:
                print(html[:2000])
except Exception as e:
    print('ERROR:', e)
