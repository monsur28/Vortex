import sys
from playwright.sync_api import sync_playwright

print("Navigating to page and intercepting network requests...", flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    def handle_request(request):
        print(f"REQ: {request.url}", flush=True)
            
    page.on("request", handle_request)
    
    print("Going to URL...", flush=True)
    try:
        page.goto("https://s1.sportzfytvlive.xyz/watch/Lpxqk597rkh7kwz5799vr97r779n9h", wait_until="load", timeout=10000)
    except Exception as e:
        print(f"Timeout or error: {e}", flush=True)
    
    print(f"Page Title: {page.title()}", flush=True)
    
    try:
        browser.close()
    except Exception as e:
        print(f"Close error: {e}", flush=True)
