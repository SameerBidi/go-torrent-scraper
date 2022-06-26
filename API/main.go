package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type site struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

var sitesAvailable = []site{
	{Id: 1, Name: "1337x"},
	// {Id: 2, Name: "ThePirateBay"},
}

func getSites(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, sitesAvailable)
}

func searchTorrents(c *gin.Context) {
	searchKey := c.Param("searchKey")

	siteId, err := strconv.Atoi(c.Param("siteId"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "error": "Invalid site"})
		return
	}

	page := c.Query("page")
	var pageNumber int = 1
	if page != "" {
		pageNumber, err = strconv.Atoi(page)
		if err != nil || pageNumber < 0 {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid value provided for 'page' parameter, allowed values are Positive Integres"})
			return
		}
	}

	safe := c.Query("safe")
	var safeSearch bool = false
	if safe != "" {
		safeSearch, err = strconv.ParseBool(safe)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid value provided for 'safe' parameter, allowed values are 0,False,1,True"})
			return
		}
	}

	if siteId == 1 {
		c.IndentedJSON(http.StatusOK, Search1337x(searchKey, pageNumber, safeSearch))
	} else {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "error": "Invalid site"})
	}
}

func getTorrentData(c *gin.Context) {
	link := c.Query("link")

	siteId, err := strconv.Atoi(c.Param("siteId"))
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "error": "Invalid site"})
		return
	}

	if siteId == 1 {
		c.IndentedJSON(http.StatusOK, Get1337xTorrentData(link))
	} else {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "error": "Invalid site"})
	}
}

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/sites", getSites)
	router.GET("/sites/:siteId/search/:searchKey", searchTorrents)
	router.GET("/sites/:siteId/torrent-data", getTorrentData)

	router.Run("localhost:50001")
}
