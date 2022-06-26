# Golang Torrent Scraper

A simple torrent scraper using Golang

Currently scrapes sites: 1337x

## Working Demo

http://samcloud.tplinkdns.com/torrent-go

## API

Get a list of sites:
```yaml
/sites

No Parameters
```

Search a site for torrents:
```yaml
/sites/:siteId/search/:searchKey

Optional Parameters:
{"safe" : safeSearch, "page" : pageNumber}
```

Get magnet link and file list:
```yaml
/sites/:siteId/torrent-data

Parameters:
{"link" : link}
```

## API Examples and Demos
### Try these in your browser

Geting list of sites:

http://samcloud.tplinkdns.com:50001/sites

Returns JSON:
```yaml
[
  {
    "id": 1,
    "name": "1337x"
  }
]
```

Searching 1337x for Call of duty torrents:

http://samcloud.tplinkdns.com:50001/sites/1/search/call%20of%20duty?safe=true&page=1

Returns JSON:
```yaml
[
    {
        "name": "Call of Duty 2 1.3 Repack Mr DJ",
        "seeders": 949,
        "leechers": 61,
        "size": "3.5 GB",
        "date": 1493337600,
        "uploader": "Sigaint",
        "link": "https://1337xx.to/torrent/1835137/Call-of-Duty-2-1-3-Repack-Mr-DJ/"
    },
    {
        "name": "Call of Duty Modern Warfare 3-RELOADED",
        "seeders": 810,
        "leechers": 129,
        "size": "13.8 GB",
        "date": 1335225600,
        "uploader": "piratepedia",
        "link": "https://1337xx.to/torrent/263501/Call-of-Duty-Modern-Warfare-3-RELOADED/"
    }
]
```

Geting magnet link and file list from 1337x site:

http://samcloud.tplinkdns.com:50001/sites/1/torrent-data?link=https://1337xx.to/torrent/1835137/Call-of-Duty-2-1-3-Repack-Mr-DJ/

Returns JSON:
```yaml
{
  "magnet": "magnet:?xt=urn:btih:4F515CD16844D3...announce",
  "files": [
        "Torrent downloaded from ExtraTorrent.cc.txt (0.0 KB)",
        "Torrent Downloaded from Glodls.to.txt (0.0 KB)",
        "Torrent downloaded from kat.cr.txt (0.0 KB)",
        "autorun.inf (0.1 KB)",
        "Instructions.txt (1.3 KB)",
        "Icon.ico (14.0 KB)",
        "Setup.exe (21.2 MB)",
        "DJ.bin (3.4 GB)"
    ]
}
```

## Setting up and running the server
Will update soon

## License
[MIT](https://opensource.org/licenses/MIT)
