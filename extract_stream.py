import sys
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Playwright is not installed.")
    sys.exit(1)

print("Navigating to page and intercepting network requests...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    stream_url = None
    def handle_request(request):
        global stream_url
        # Many streams use .m3u8 or .ts
        if ".m3u8" in request.url:
            stream_url = request.url
            print(f"FOUND_STREAM: {stream_url}")
            
    page.on("request", handle_request)
    try:
        page.goto("https://s1.sportzfytvlive.xyz/watch/Lpxqk597rkh7kwz5799vr97r779n9h", wait_until="networkidle", timeout=15000)
    except Exception as e:
        pass # Ignore timeout if we already found it
    
    if not stream_url:
        print("Could not find the m3u8 stream URL.")
        
    browser.close()
