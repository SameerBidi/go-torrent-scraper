package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
	"github.com/gocolly/colly/proxy"
	"github.com/itchyny/timefmt-go"
)

type torrent struct {
	Name     string `json:"name"`
	Seeders  int    `json:"seeders"`
	Leechers int    `json:"leechers"`
	Size     string `json:"size"`
	Date     int64  `json:"date"`
	Uploader string `json:"uploader"`
	Link     string `json:"link"`
}

type torrentData struct {
	Magnet string   `json:"magnet"`
	Files  []string `json:"files"`
}

type proxyData struct {
	Ip string `json:"ip"`
}

func getProxies() string {
	proxyJsonFilePath := "proxies.json"
	proxyJsonFile, err := os.Open(proxyJsonFilePath)
	if err != nil {
		fmt.Printf("failed to open json file: %s, error: %v", proxyJsonFilePath, err)
		return ""
	}
	defer proxyJsonFile.Close()

	proxyJson, err := ioutil.ReadAll(proxyJsonFile)
	if err != nil {
		fmt.Printf("failed to read json file, error: %v", err)
		return ""
	}

	fmt.Printf("%s\n\n", proxyJson)

	var proxyData []proxyData
	if err := json.Unmarshal(proxyJson, &proxyData); err != nil {
		fmt.Printf("failed to unmarshal json file, error: %v", err)
		return ""
	}

	return proxyData[0].Ip
}

func search1337x(searchQuery string) []torrent {

	torrents := make([]torrent, 0)

	c := colly.NewCollector(colly.AllowURLRevisit())

	// Rotate two socks5 proxies
	rp, err := proxy.RoundRobinProxySwitcher(getProxies())
	if err != nil {
		_ = fmt.Errorf(err.Error())
	}
	c.SetProxyFunc(rp)

	c.OnHTML("tbody > tr", func(tr *colly.HTMLElement) {
		a := tr.DOM.Find("td.coll-1 > a").Eq(1)
		name := a.Text()

		seeders := tr.DOM.Find("td.coll-2").First().Text()
		seedersInt, _ := strconv.Atoi(seeders)
		leechers := tr.DOM.Find("td.coll-3").First().Text()
		leechersInt, _ := strconv.Atoi(leechers)
		size := tr.DOM.Find("td.coll-4").First().Text()
		size = strings.Split(size, "B")[0] + "B"

		date := tr.DOM.Find("td.coll-date").First().Text()
		dateReplacer := strings.NewReplacer("nd", "", "th", "", "rd", "", "st", "")
		date = dateReplacer.Replace(date)
		dateFormatted, _ := timefmt.Parse(date, "%b. %d '%y")

		uploader := tr.DOM.Find("td.coll-5").First().Text()
		link, _ := a.Attr("href")

		torrent := torrent{
			Name:     name,
			Seeders:  seedersInt,
			Leechers: leechersInt,
			Size:     size,
			Date:     dateFormatted.Unix(),
			Uploader: uploader,
			Link:     "https://1337x.to" + link,
		}

		torrents = append(torrents, torrent)
	})

	c.Visit("https://1337x.to/search/" + searchQuery + "/1/")

	return torrents
}

func get1337xTorrentData(link string) torrentData {

	var torrentData torrentData

	c := colly.NewCollector(colly.AllowURLRevisit())

	// Rotate two socks5 proxies
	rp, err := proxy.RoundRobinProxySwitcher(getProxies())
	if err != nil {
		_ = fmt.Errorf(err.Error())
	}
	c.SetProxyFunc(rp)

	c.OnHTML("div.col-9.page-content", func(div *colly.HTMLElement) {

		magnet, _ := div.DOM.Find("ul.dropdown-menu > li > a").Last().Attr("href")

		var files []string

		div.DOM.Find("div.file-content > ul > li").Each(func(i int, fileLi *goquery.Selection) {
			file := fileLi.Text()
			file = strings.Replace(file, "\n", "", -1)

			files = append(files, file)
		})

		torrentData.Magnet = magnet
		torrentData.Files = files
	})

	c.Visit(link)

	return torrentData
}

// func main() {
// 	data, _ := json.MarshalIndent(search1337x("stranger things"), "", " ")

// 	fmt.Printf("%s\n", string(data))
// 	//fmt.Printf(search1337x())
// }
