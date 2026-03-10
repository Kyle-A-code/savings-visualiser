package routes

import (
	"github.com/Kyle-A-code/savings-visualiser/handlers"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddBucketRoutes(router *gin.Engine, db *gorm.DB) {
	buckets := router.Group("/buckets")
	bucketRepository := repositories.NewBucketRepository(db)

	buckets.GET("", handlers.GetBuckets(bucketRepository))
	buckets.GET("/:id", handlers.GetBucketById(bucketRepository))
	buckets.POST("", handlers.CreateBucket(bucketRepository))
	buckets.PATCH("/:id", handlers.PatchBucket(bucketRepository))
	buckets.DELETE("/:id", handlers.DeleteBucketById(bucketRepository))
}
