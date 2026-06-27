from playwright.sync_api import sync_playwright
import json
import time

def scrape_fisolive():
    print("Starting Playwright...")
    with sync_playwright() as p:
        browser = p.firefox.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        print("Navigating to https://fisolive.xo.je/ ...")
        page.goto("https://fisolive.xo.je/")
        
        # Wait for the challenge to pass (could take up to 5 seconds)
        print("Waiting for page load and anti-bot challenge...")
        page.wait_for_timeout(5000)
        
        # We can dump the HTML to see what loaded
        html_content = page.content()
        with open("fiso_dump_playwright.html", "w", encoding="utf-8") as f:
            f.write(html_content)
        print("Dumped HTML to fiso_dump_playwright.html")

        # Try to find channels
        # Usually they are inside a javascript array or DOM elements
        # Let's extract script contents to look for channel data
        scripts = page.evaluate("() => Array.from(document.querySelectorAll('script')).map(s => s.innerText)")
        
        channel_data = None
        for script in scripts:
            if "chan=" in script or "channels=" in script or "chan =" in script or "channels =" in script:
                print("Found a script potentially containing channel data!")
                # Let's just evaluate the variable in the page
                try:
                    # Let's check common variable names
                    data = page.evaluate("() => typeof chan !== 'undefined' ? chan : (typeof channels !== 'undefined' ? channels : null)")
                    if data:
                        channel_data = data
                except Exception as e:
                    print("Could not evaluate channel variable:", e)

        # Let's also check for DOM elements just in case it's rendered
        elements = page.evaluate("""() => {
            let res = [];
            let rows = document.querySelectorAll('.channel-row');
            rows.forEach(r => {
                let name = r.querySelector('.channel-name');
                let img = r.querySelector('.c-logo');
                let onclick = r.getAttribute('onclick');
                res.push({
                    name: name ? name.innerText : 'Unknown',
                    logo: img ? img.src : '',
                    onclick: onclick
                });
            });
            return res;
        }""")

        if elements:
            print(f"Extracted {len(elements)} channels from the DOM.")
            with open("fiso_channels_dom.json", "w", encoding="utf-8") as f:
                json.dump(elements, f, indent=4)
        
        if channel_data:
            print("Extracted channel data from JS variables.")
            with open("fiso_channels_js.json", "w", encoding="utf-8") as f:
                json.dump(channel_data, f, indent=4)
                
        if not elements and not channel_data:
            print("Could not find channels in DOM or JS. Please inspect fiso_dump_playwright.html")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    scrape_fisolive()
