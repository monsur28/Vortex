import requests
from bs4 import BeautifulSoup
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

url = 'https://fisolive.xo.je/'

try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    print("Page fetched successfully. Length:", len(response.text))
    
    # Let's save the HTML for manual inspection if needed
    with open('fiso_dump.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
        
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Look for scripts
    scripts = soup.find_all('script')
    for i, script in enumerate(scripts):
        if script.string:
            if 'channels' in script.string.lower() or 'm3u' in script.string.lower() or 'var chan' in script.string.lower():
                print(f"Found something interesting in inline script {i}:")
                print(script.string[:500])
        elif script.get('src'):
            print(f"External script: {script.get('src')}")
            
except Exception as e:
    print(f"Error fetching: {e}")
