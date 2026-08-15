package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/query"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
	"github.com/Kyle-A-code/savings-visualiser/usecases"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetTransactions(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		params, err := parseTransactionListQuery(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		transactions, totalRecords, err := repo.GetAll(ctx, params)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		c.IndentedJSON(http.StatusOK, NewPaginatedResponse(newTransactionResponseDTOs(transactions), totalRecords, params))
	}
}

func GetTransactionById(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		id, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		transaction, err := repo.GetById(ctx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, newErrorResponse(err.Error()))
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		c.IndentedJSON(http.StatusOK, newTransactionResponseDTO(transaction))
	}
}

func GetTransactionsForBucket(repo *repositories.TransactionRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		bucketID, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}
		params, err := parseTransactionListQuery(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		transactions, totalRecords, err := repo.GetForBucket(ctx, bucketID, params)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}

		c.IndentedJSON(http.StatusOK, NewPaginatedResponse(newTransactionResponseDTOs(transactions), totalRecords, params))
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
			c.IndentedJSON(http.StatusBadRequest, newErrorResponse(err.Error()))
			return
		}
		if request.Title == "" {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse("title cannot be blank"))
			return
		}
		if request.BucketID <= 0 {
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse("bucketId must be a positive integer"))
			return
		}

		transaction := models.Transaction{
			Title:    request.Title,
			Amount:   request.Amount,
			BucketID: request.BucketID,
		}
		if err := repo.Create(ctx, &transaction); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, newErrorResponse(err.Error()))
				return
			}
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		c.IndentedJSON(http.StatusCreated, newTransactionResponseDTO(transaction))
	}
}

func TransferTransaction(transferUsecase *usecases.TransferUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()

		var request struct {
			FromBucketID int     `json:"fromBucketId"`
			ToBucketID   int     `json:"toBucketId"`
			Amount       float64 `json:"amount"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.IndentedJSON(http.StatusBadRequest, newErrorResponse(err.Error()))
			return
		}

		if err := transferUsecase.Execute(ctx, request.FromBucketID, request.ToBucketID, request.Amount); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, newErrorResponse(err.Error()))
				return
			}
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
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
			c.IndentedJSON(http.StatusUnprocessableEntity, newErrorResponse(err.Error()))
			return
		}

		rows, err := repo.Delete(ctx, id)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, newErrorResponse(err.Error()))
			return
		}
		if rows == 0 {
			c.IndentedJSON(http.StatusNotFound, newErrorResponse("transaction not found"))
			return
		}

		c.IndentedJSON(http.StatusNoContent, "")
	}
}

func parseTransactionListQuery(c *gin.Context) (query.ListParams, error) {
	params, err := parseListQuery(c)
	if err != nil {
		return params, err
	}

	if err := validateTransactionListParams(&params); err != nil {
		return params, err
	}

	return params, nil
}

func validateTransactionListParams(params *query.ListParams) error {
	if err := validateOrderParams(params.Order); err != nil {
		return err
	}
	return validateFilterParams(params)
}

func validateOrderParams(order *string) error {
	validOrderParams := []string{"createdAt", "-createdAt"}
	if order == nil {
		return nil
	}

	if !slices.Contains(validOrderParams, *order) {
		return fmt.Errorf("order must be one of: %s", strings.Join(validOrderParams, ", "))
	}
	return nil
}

func validateFilterParams(params *query.ListParams) error {
	validFilterParams := []string{"title", "type"}

	if params.Filter == nil {
		return nil
	}

	filters := *params.Filter
	for key, value := range filters {
		if !slices.Contains(validFilterParams, key) {
			return fmt.Errorf("filter must be one of: %s", strings.Join(validFilterParams, ", "))
		}

		switch key {
		case "title":
			if err := validateTitleFilter(filters, key, value); err != nil {
				return err
			}
		case "type":
			if err := validateTypeFilter(filters, key, value); err != nil {
				return err
			}
		}
	}

	if len(filters) == 0 {
		params.Filter = nil
	}

	return nil
}

func validateTitleFilter(filters map[string]string, key string, value string) error {
	title := strings.TrimSpace(value)
	if title == "" {
		delete(filters, key)
		return nil
	}
	filters[key] = title
	return nil
}

func validateTypeFilter(filters map[string]string, key string, value string) error {
	validFilterValues := []string{"credit", "debit"}

	filterValue := strings.ToLower(strings.TrimSpace(value))
	if filterValue == "" {
		delete(filters, key)
		return nil
	}
	if !slices.Contains(validFilterValues, filterValue) {
		return fmt.Errorf("filter.%s must be one of: %s", key, strings.Join(validFilterValues, ", "))
	}
	filters[key] = filterValue
	return nil
}
