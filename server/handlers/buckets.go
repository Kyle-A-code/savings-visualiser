package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Kyle-A-code/savings-visualiser/models"
)

func GetBucketById(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
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
		ctx := c.Request.Context()

		buckets, err := gorm.G[models.Bucket](db).Find(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.IndentedJSON(http.StatusOK, buckets)
	}
}

func CreateBucket(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

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

func PatchBucket(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			Title string
		}

		ctx := c.Request.Context()
		id := c.Param("id")

		if err := c.ShouldBindJSON(&request); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if request.Title == "" {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "Title cannot be blank"})
			return
		}

		rows, err := gorm.G[models.Bucket](db).
			Where("id = ?", id).
			Update(ctx, "title", request.Title)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rows == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
			return
		}

		updated, err := gorm.G[models.Bucket](db).Where("id = ?", id).First(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusOK, updated)
	}
}

func DeleteBucketById(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		id := c.Param("id")

		_, err := gorm.G[models.Bucket](db).Where("id = ?", id).Delete(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusNoContent, "")
	}
}
