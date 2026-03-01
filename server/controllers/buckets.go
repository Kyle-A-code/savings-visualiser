package controllers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Kyle-A-code/savings-visualiser/models"
)

// GetBucketById returns a Gin handler that fetches a bucket by ID.
func GetBucketById(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()
		id := c.Param("id")

		bucket, err := gorm.G[models.Bucket](db).Where("id = ?", id).First(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.IndentedJSON(http.StatusOK, bucket)
	}
}

func GetBuckets(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()

		bucket, err := gorm.G[models.Bucket](db).Find(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.IndentedJSON(http.StatusOK, bucket)
	}
}

func CreateBucket(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()

		var bucket models.Bucket

		if err := c.ShouldBindJSON(&bucket); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if bucket.Balance <= 0 {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "balance must be positive"})
			return
		}

		existing, err := gorm.G[models.Bucket](db).Where("title = ?", bucket.Title).First(ctx)
		if err == nil {
			c.IndentedJSON(http.StatusConflict, gin.H{"error": "a bucket with this title already exists", "existing_id": existing.ID})
			return
		}
		if err != gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := gorm.G[models.Bucket](db).Create(ctx, &bucket); err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusCreated, bucket)
	}
}

func DeleteBucketById(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()

		id := c.Param("id")

		_, err := gorm.G[models.Bucket](db).Where("id = ?", id).Delete(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusNoContent, "")
	}
}