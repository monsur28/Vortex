import sys
from playwright.sync_api import sync_playwright

print("Navigating to page and intercepting network requests...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    urls = []
    def handle_request(request):
        urls.append(request.url)
            
    page.on("request", handle_request)
    try:
        page.goto("https://s1.sportzfytvlive.xyz/watch/Lpxqk597rkh7kwz5799vr97r779n9h", wait_until="networkidle", timeout=15000)
    except Exception as e:
        pass
    
    print(f"Page Title: {page.title()}")
    page.screenshot(path="screenshot.png")
    
    with open("requests.log", "w") as f:
        for u in urls:
            f.write(u + "\n")
            
    browser.close()
