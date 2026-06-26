import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import concurrent.futures
import requests

def parse_m3u(file_path):
    channels = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return channels
    
    current_channel = {}
    for line in lines:
        line = line.strip()
        if line.startswith('#EXTINF:'):
            # Parse EXTINF
            parts = line.split(',', 1)
            if len(parts) > 1:
                current_channel['name'] = parts[1].strip()
            
            # Simple attribute extraction
            if 'tvg-logo="' in line:
                current_channel['logo'] = line.split('tvg-logo="')[1].split('"')[0]
            if 'group-title="' in line:
                current_channel['group'] = line.split('group-title="')[1].split('"')[0]
            if 'tvg-id="' in line:
                current_channel['id'] = line.split('tvg-id="')[1].split('"')[0]
                
        elif line and not line.startswith('#'):
            current_channel['url'] = line
            channels.append(current_channel)
            current_channel = {}
            
    return channels

def check_channel(channel):
    try:
        url = channel.get('url')
        if not url:
            return None
        # Many streams don't support HEAD, so we use GET with stream=True and a timeout
        response = requests.get(url, timeout=5, stream=True)
        if response.status_code == 200:
            return channel
    except Exception:
        pass
    return None

def main(input_m3u, output_json):
    channels = parse_m3u(input_m3u)
    if not channels:
        print("No channels found. Make sure the M3U file is valid and correctly formatted.")
        return

    print(f"Parsed {len(channels)} channels from {input_m3u}. Checking status...")
    
    alive_channels = []
    # Use ThreadPoolExecutor to check channels in parallel (adjust max_workers as needed)
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        future_to_channel = {executor.submit(check_channel, ch): ch for ch in channels}
        for count, future in enumerate(concurrent.futures.as_completed(future_to_channel), 1):
            res = future.result()
            if res:
                alive_channels.append(res)
                print(f"[{count}/{len(channels)}] Alive: {res['name']}")
            else:
                print(f"[{count}/{len(channels)}] Dead/Timeout")
    
    print(f"\nFinished! Found {len(alive_channels)} alive channels out of {len(channels)}.")
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(alive_channels, f, indent=2, ensure_ascii=False)
    print(f"Saved alive channels to {output_json}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python check_channels.py <input.m3u> <output.json>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
