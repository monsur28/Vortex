import urllib.request

streams = [
    ("English Feed 1 (XYZSTRM)", "https://lb.xyzcloud3.xyz/FOX/index.m3u8", "https://xyzstreams.st", "https://xyzstreams.st"),
    ("English Feed 2 (STRMHUB)", "https://obstreamx.click/live/yq97gcrutx.m3u8", "https://getembed.live/embed-player?stream=yq97gcrutx", "https://getembed.live/embed-player?stream=yq97gcrutx"),
    ("English Feed 2 (XYZSTRM)", "https://lb.xyzcloud3.xyz/FS1/index.m3u8", "https://xyzstreams.st", "https://xyzstreams.st"),
    ("English Feed 3 (STRMHUB)", "https://obstreamx.click/live/01axyd1huy.m3u8", "https://getembed.live/embed-player?stream=01axyd1huy", "https://getembed.live/embed-player?stream=01axyd1huy"),
    ("English Feed 3 (XYZSTRM)", "https://lb.xyzcloud3.xyz/BBC/index.m3u8", "https://xyzstreams.st", "https://xyzstreams.st")
]

for name, url, ref, orig in streams:
    req = urllib.request.Request(url, headers={
        "Referer": ref,
        "Origin": orig,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0"
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        print(f"{name}: ALIVE (HTTP {resp.getcode()})")
    except Exception as e:
        print(f"{name}: DEAD ({e})")
