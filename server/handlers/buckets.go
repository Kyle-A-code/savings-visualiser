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
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		bucket, err := repo.GetById(ctx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, newErrorResponse(err.Error()))
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}
		c.IndentedJSON(http.StatusOK, newBucketResponseDTO(bucket))
	}
}

func GetBuckets(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		buckets, err := repo.GetAll(ctx)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}
		c.IndentedJSON(http.StatusOK, newBucketResponseDTOs(buckets))
	}
}

func CreateBucket(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var request struct {
			Title  string  `json:"title"`
			Amount float64 `json:"amount"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.IndentedJSON(http.StatusBadRequest, newErrorResponse(err.Error()))
			return
		}

		if request.Title == "" {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse("title cannot be blank"))
			return
		}
		if request.Amount <= 0 {
			c.IndentedJSON(http.StatusBadRequest, newErrorResponse("initialBalance must be positive"))
			return
		}

		bucket := models.Bucket{Title: request.Title}

		_, err := repo.GetByTitle(ctx, bucket.Title)
		if err == nil {
			c.IndentedJSON(http.StatusConflict, newErrorResponse("a bucket with this title already exists"))
			return
		}
		if err != gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		if err := repo.Create(ctx, &bucket, request.Amount); err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		created, err := repo.GetById(ctx, int(bucket.ID))
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		c.IndentedJSON(http.StatusCreated, newBucketResponseDTO(created))
	}
}

func PatchBucket(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			Title string `json:"title"`
		}

		ctx := c.Request.Context()
		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.IndentedJSON(http.StatusBadRequest, newErrorResponse(err.Error()))
			return
		}

		if request.Title == "" {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse("Title cannot be blank"))
			return
		}

		rows, err := repo.UpdateTitle(ctx, id, request.Title)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}
		if rows == 0 {
			c.IndentedJSON(http.StatusNotFound, newErrorResponse("bucket not found"))
			return
		}

		updated, err := repo.GetById(ctx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, newErrorResponse(err.Error()))
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		c.IndentedJSON(http.StatusOK, newBucketResponseDTO(updated))
	}
}

func DeleteBucketById(repo *repositories.BucketRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		_, err = repo.Delete(ctx, id)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		c.IndentedJSON(http.StatusNoContent, "")
	}
}
