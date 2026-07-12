import json
import os

fox_channels = [
    {
        "name": "FOX ONE - AQ",
        "logo": "https://images.seeklogo.com/logo-png/28/1/fox-sports-logo-png_seeklogo-284763.png",
        "url": "https://otte.cache.aiv-cdn.net/bom-nitro/live/clients/dash/enc/ajfoeddkbz/out/v1/b78800b9b2304879b15843f455836829/cenc.mpd",
        "type": "dash",
        "group": "FOX",
        "kid": "f6564ec2aee819046328a0e153be574d",
        "key": "ff46a8a1031eb27ef22576a077c98ab7",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX ONE HDR",
        "logo": "https://r2.thesportsdb.com/images/media/channel/logo/sonnfj1629403437.png",
        "url": "https://otte.cache.aiv-cdn.net/bom-nitro/live/clients/dash/enc/rgmw19qjux/out/v1/c6ac7e638a9d4998891ae85aba377c59/cenc.mpd",
        "type": "dash",
        "group": "FOX",
        "kid": "48afc63fa0ecccc3a71f46d3fda20249",
        "key": "c7cd8801e238a263fe4349a95682b83b",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX SPORTS 4K",
        "logo": "https://images.seeklogo.com/logo-png/28/1/fox-sports-logo-png_seeklogo-284763.png",
        "url": "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/enc/lsilniwjf7/out/v1/fc40f22f10374517a2784e1d97cb23f4/cenc.mpd",
        "type": "dash",
        "group": "4K",
        "kid": "1f68713028d439ec03be07f56c1d6213",
        "key": "20093db6455160fffed4c394def3193d",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX ONE HD",
        "logo": "https://images.seeklogo.com/logo-png/28/1/fox-sports-logo-png_seeklogo-284763.png",
        "url": "https://otte.cache.aiv-cdn.net/bom-nitro/live/clients/dash/enc/cizlveblk4/out/v1/e5c36c41621e4384b80427d87199433a/cenc.mpd",
        "type": "dash",
        "group": "FOX",
        "kid": "d7d78ea2021a29541136bd5dc8352fe7",
        "key": "6425ac4c0cdf906fe0cce5cf40dc8933",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX ONE - AQ",
        "logo": "https://images.seeklogo.com/logo-png/28/1/fox-sports-logo-png_seeklogo-284763.png",
        "url": "https://otte.cache.aiv-cdn.net/bom-nitro/live/clients/enc/ajfoeddkbz/out/v1/b78800b9b2304879b15843f455836829/cenc.mpd",
        "type": "dash",
        "group": "FOX",
        "kid": "f6564ec2aee819046328a0e153be574d",
        "key": "ff46a8a1031eb27ef22576a077c98ab7",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX SPORTS HD",
        "logo": "https://images.seeklogo.com/logo-png/28/1/fox-sports-logo-png_seeklogo-284763.png",
        "url": "https://otte.cache.aiv-cdn.net/bom-nitro/live/clients/dash/enc/zpfs5hlgya/out/v1/84b1d591a23640178a8e8aa43c6e59a7/cenc.mpd",
        "type": "dash",
        "group": "FOX",
        "kid": "0cc2f872759c96de70237e6fa6de03d0",
        "key": "a879b1d38ed002d4018bce96f9219b8d",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX ONE - AQ",
        "logo": "https://images.seeklogo.com/logo-png/28/1/fox-sports-logo-png_seeklogo-284763.png",
        "url": "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/dash/enc/ajfoeddkbz/out/v1/b78800b9b2304879b15843f455836829/cenc.mpd",
        "type": "dash",
        "group": "FOX",
        "kid": "f6564ec2aee819046328a0e153be574d",
        "key": "ff46a8a1031eb27ef22576a077c98ab7",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX FHD HDR",
        "logo": "",
        "url": "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/dash/enc/rgmw19qjux/out/v1/c6ac7e638a9d4998891ae85aba377c59/cenc.mpd",
        "type": "dash",
        "group": "FOX",
        "kid": "48afc63fa0ecccc3a71f46d3fda20249",
        "key": "c7cd8801e238a263fe4349a95682b83b",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "name": "FOX ONE 4K",
        "logo": "",
        "url": "https://otte.cache.aiv-cdn.net/iad-nitro/live/clients/enc/xperu6ixu9/out/v1/31d30c91fc65458789b84209d3fa22e4/cenc.mpd",
        "type": "dash",
        "group": "4K",
        "kid": "1f68713028d439ec03be07f56c1d6213",
        "key": "20093db6455160fffed4c394def3193d",
        "useProxy": True,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
    },
    {
        "group": "FS",
        "name": "FS1 05",
        "url": "http://wickediptv.xyz/Randall123/Randall321/53390",
        "useProxy": False
    }
]

def main():
    json_path = 'data/channels.json'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        existing_channels = json.load(f)
        
    # Replace existing or append
    for new_ch in fox_channels:
        # Check if a channel with the same name exists
        found = False
        for i, ch in enumerate(existing_channels):
            if ch.get('name') == new_ch.get('name'):
                existing_channels[i] = new_ch
                found = True
                break
        
        if not found:
            existing_channels.append(new_ch)
            
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(existing_channels, f, indent=4, ensure_ascii=False)

if __name__ == '__main__':
    main()
