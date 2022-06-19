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

func getTorrents(c *gin.Context) {
	searchKey := c.Query("searchKey")
	siteId, _ := strconv.Atoi(c.Query("siteId"))

	if siteId == 1 {
		c.IndentedJSON(http.StatusOK, search1337x(searchKey))
	} else {
		c.IndentedJSON(http.StatusBadRequest, nil)
	}
}

func getTorrentData(c *gin.Context) {
	link := c.Query("link")
	siteId, _ := strconv.Atoi(c.Query("siteId"))

	if siteId == 1 {
		c.IndentedJSON(http.StatusOK, get1337xTorrentData(link))
	} else {
		c.IndentedJSON(http.StatusBadRequest, nil)
	}
}

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/getSites", getSites)
	router.GET("/getTorrents", getTorrents)
	router.GET("/getTorrentData", getTorrentData)

	router.Run("0.0.0.0:50001")
}
