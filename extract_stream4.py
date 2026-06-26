import sys
import time
from playwright.sync_api import sync_playwright

print("Navigating to page and intercepting network requests...", flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    m3u8_url = None
    
    def handle_request(request):
        global m3u8_url
        if ".m3u8" in request.url or ".mpd" in request.url:
            m3u8_url = request.url
            print(f"FOUND_STREAM: {m3u8_url}", flush=True)
            
    page.on("request", handle_request)
    
    try:
        page.goto("https://s1.sportzfytvlive.xyz/watch/Lpxqk597rkh7kwz5799vr97r779n9h", timeout=15000)
    except Exception as e:
        print("Goto exception:", e)
        
    print("Waiting 5 seconds for player to load...", flush=True)
    page.wait_for_timeout(5000)
    
    print("Clicking center of page to start playback...", flush=True)
    try:
        page.mouse.click(400, 300)
        page.wait_for_timeout(5000)
    except:
        pass
        
    if m3u8_url:
        print(f"Successfully got stream: {m3u8_url}")
    else:
        print("Did not find stream.")
    
    browser.close()
