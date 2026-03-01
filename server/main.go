package main

import (
	"github.com/Kyle-A-code/savings-visualiser/controllers"
	"github.com/Kyle-A-code/savings-visualiser/database"
	"github.com/gin-gonic/gin"
)

func main() {
	db := database.GetDatabase()
	router := gin.Default()
	router.GET("/buckets/:id", controllers.GetBucketById(db))
	router.POST("/buckets", controllers.CreateBucket(db))
	router.GET("/buckets", controllers.GetBuckets(db))
	router.DELETE("/buckets/:id", controllers.DeleteBucketById(db))

	router.Run("localhost:8080")
}