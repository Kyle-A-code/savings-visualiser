package handlers

import (
	"errors"
	"net/http"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetTransactions(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		params, err := parsePaginationQuery(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		transactions, totalRecords, err := repo.GetAll(ctx, params)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusOK, NewPaginatedResponse(transactions, totalRecords, params))
	}
}

func GetTransactionById(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		transaction, err := repo.GetById(ctx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusOK, transaction)
	}
}

func GetTransactionsForBucket(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		bucketID, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}
		params, err := parsePaginationQuery(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		transactions, totalRecords, err := repo.GetForBucket(ctx, bucketID, params)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusOK, NewPaginatedResponse(transactions, totalRecords, params))
	}
}

func CreateTransaction(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var request struct {
			Title    string  `json:"title"`
			Amount   float64 `json:"amount"`
			BucketID int     `json:"bucketId"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if request.Title == "" {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": "title cannot be blank"})
			return
		}
		if request.BucketID <= 0 {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": "bucketId must be a positive integer"})
			return
		}

		transaction := models.Transaction{
			Title:    request.Title,
			Amount:   request.Amount,
			BucketId: request.BucketID,
		}
		if err := repo.Create(ctx, &transaction); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusCreated, transaction)
	}
}

func TransferTransaction(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var request struct {
			FromBucketID int     `json:"fromBucketId"`
			ToBucketID   int     `json:"toBucketId"`
			Amount       float64 `json:"amount"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := repo.Transfer(ctx, request.FromBucketID, request.ToBucketID, request.Amount); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusCreated, gin.H{"status": "ok"})
	}
}

func DeleteTransactionByID(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		rows, err := repo.Delete(ctx, id)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rows == 0 {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "transaction not found"})
			return
		}

		c.IndentedJSON(http.StatusNoContent, "")
	}
}
