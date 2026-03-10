package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
)

func GetBucketById(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		bucket, err := repo.GetById(ctx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.IndentedJSON(http.StatusOK, bucket)
	}
}

func GetBuckets(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		buckets, err := repo.GetAll(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.IndentedJSON(http.StatusOK, buckets)
	}
}

func CreateBucket(repo *repositories.BucketRepository) gin.HandlerFunc {
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

		existing, err := repo.GetByTitle(ctx, bucket.Title)
		if err == nil {
			c.IndentedJSON(http.StatusConflict, gin.H{"error": "a bucket with this title already exists", "existing_id": existing.ID})
			return
		}
		if err != gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := repo.Create(ctx, &bucket); err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusCreated, bucket)
	}
}

func PatchBucket(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			Title string
		}

		ctx := c.Request.Context()
		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if request.Title == "" {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "Title cannot be blank"})
			return
		}

		rows, err := repo.UpdateTitle(ctx, id, request.Title)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rows == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
			return
		}

		updated, err := repo.GetById(ctx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusOK, updated)
	}
}

func DeleteBucketById(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		_, err = repo.Delete(ctx, id)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusNoContent, "")
	}
}
