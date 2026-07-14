import json
import os

file_path = r"e:\Web Development Journey\Day 92 - IPTV\IPTV\data\channels.json"
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

new_channels = [
    {
        "name": "Server 1",
        "group": "FIFA World Cup 2026",
        "url": "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8",
        "useProxy": False
    },
    {
        "name": "Server 2",
        "group": "FIFA World Cup 2026",
        "url": "http://starhub.pro/live/farhat-3379/67897-913379/742610.ts",
        "bufferless": True,
        "useProxy": False
    },
    {
        "name": "Server 3",
        "group": "FIFA World Cup 2026",
        "url": "http://s.rocketdns.info:8080/live/monstercable/Dq6jjknxCr/3145.ts",
        "bufferless": True,
        "useProxy": False
    },
    {
        "name": "Server 4",
        "group": "FIFA World Cup 2026",
        "url": "https://cp11.adabmedia.com/hls2/sport.m3u8?nocache=1782057214460",
        "useProxy": False
    },
    {
        "name": "Server 5",
        "group": "FIFA World Cup 2026",
        "url": "http://rgkkw.live/live/1Aoen7elp5/IgMJ60tmAa/748388.m3u8",
        "useProxy": False
    }
]

# Insert right after the last "FIFA World Cup 2026" or at the beginning.
# Let's just insert them at the beginning of the list, or right after the first item.
data = new_channels + data

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)
