package routes

import (
	"github.com/Kyle-A-code/savings-visualiser/handlers"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddBucketRoutes(router *gin.Engine, db *gorm.DB) {
	buckets := router.Group("/buckets")

	buckets.GET("", handlers.GetBuckets(db))
	buckets.GET("/:id", handlers.GetBucketById(db))
	buckets.POST("", handlers.CreateBucket(db))
	buckets.PATCH("/:id", handlers.PatchBucket(db))
	buckets.DELETE("/:id", handlers.DeleteBucketById(db))
}
