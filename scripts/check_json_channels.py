import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import concurrent.futures
import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def check_channel(channel):
    try:
        url = channel.get('url')
        if not url:
            return None
            
        # Try a quick HEAD request first if it's an m3u8
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': '*/*'
        }
        
        response = requests.get(url, headers=headers, timeout=15, stream=True, verify=False)
        if response.status_code in (200, 206):
            return channel
    except Exception as e:
        pass
    return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python check_json_channels.py <json_file>")
        return
    
    file_path = sys.argv[1]
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            channels = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return
    
    print(f"Checking {len(channels)} channels from {file_path}...")
    
    alive_channels = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        results = executor.map(check_channel, channels)
        
        for result in results:
            if result:
                alive_channels.append(result)
                print(f"ALIVE: {result['name']} - {result['url']}")
                
    with open('data/alive_bangla.json', 'w', encoding='utf-8') as f:
        json.dump(alive_channels, f, indent=4, ensure_ascii=False)
        
    print(f"\nFound {len(alive_channels)} alive channels out of {len(channels)}.")
    print("Saved to data/alive_bangla.json")

if __name__ == '__main__':
    main()
