package handlers

import (
	"context"
	"errors"
	"net/http"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	errGoalNotFound      = errors.New("goal not found")
	errGoalAlreadyExists = errors.New("goal already exists for bucket")
	errTitleBlank        = errors.New("title cannot be blank")
	errAmountNotPositive = errors.New("amount must be positive")
)

type goalUpsertRequest struct {
	Title  string  `json:"title"`
	Amount float64 `json:"amount"`
}

func CreateBucketGoal(repo *repositories.GoalRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		bucketID, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		request, err := parseGoalUpsertRequest(c)
		if err != nil {
			if errors.Is(err, errTitleBlank) || errors.Is(err, errAmountNotPositive) {
				c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := ensureGoalDoesNotExistForBucket(ctx, repo, bucketID); err != nil {
			if errors.Is(err, errGoalAlreadyExists) {
				c.IndentedJSON(http.StatusConflict, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		goal := models.Goal{
			Title:    request.Title,
			Amount:   request.Amount,
			BucketID: bucketID,
		}

		if err := repo.Create(ctx, &goal); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": "bucket not found"})
				return
			}
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusCreated, newGoalResponseDTO(goal))
	}
}

func PatchBucketGoal(repo *repositories.GoalRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		bucketID, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		request, err := parseGoalUpsertRequest(c)
		if err != nil {
			if errors.Is(err, errTitleBlank) || errors.Is(err, errAmountNotPositive) {
				c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		existing, err := getGoalForBucket(ctx, repo, bucketID)
		if err != nil {
			if errors.Is(err, errGoalNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		patch := models.Goal{
			ID:     existing.ID,
			Title:  request.Title,
			Amount: request.Amount,
		}

		rows, err := repo.Patch(ctx, &patch)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}
		if rows == 0 {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "goal not found"})
			return
		}

		updated, err := repo.GetForBucket(ctx, bucketID)
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.IndentedJSON(http.StatusOK, newGoalResponseDTO(updated))
	}
}

func DeleteBucketGoal(repo *repositories.GoalRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		bucketID, err := parseIDParam(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
			return
		}

		goal, err := getGoalForBucket(ctx, repo, bucketID)
		if err != nil {
			if errors.Is(err, errGoalNotFound) {
				c.IndentedJSON(http.StatusNotFound, gin.H{"error": err.Error()})
				return
			}
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rows, err := repo.Delete(ctx, int(goal.ID))
		if err != nil {
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if rows == 0 {
			c.IndentedJSON(http.StatusNotFound, gin.H{"error": "goal not found"})
			return
		}

		c.IndentedJSON(http.StatusNoContent, "")
	}
}

func parseGoalUpsertRequest(c *gin.Context) (goalUpsertRequest, error) {
	var request goalUpsertRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		return goalUpsertRequest{}, err
	}

	if err := validateTitle(request.Title); err != nil {
		return goalUpsertRequest{}, err
	}
	if err := validateAmount(request.Amount); err != nil {
		return goalUpsertRequest{}, err
	}

	return request, nil
}

func validateTitle(title string) error {
	if title == "" {
		return errTitleBlank
	}
	return nil
}

func validateAmount(amount float64) error {
	if amount <= 0 {
		return errAmountNotPositive
	}
	return nil
}

func getGoalForBucket(ctx context.Context, repo *repositories.GoalRepository, bucketID int) (models.Goal, error) {
	goal, err := repo.GetForBucket(ctx, bucketID)
	if err == nil {
		return goal, nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Goal{}, errGoalNotFound
	}
	return models.Goal{}, err
}

func ensureGoalDoesNotExistForBucket(ctx context.Context, repo *repositories.GoalRepository, bucketID int) error {
	_, err := getGoalForBucket(ctx, repo, bucketID)
	if err == nil {
		return errGoalAlreadyExists
	}
	if errors.Is(err, errGoalNotFound) {
		return nil
	}
	return err
}
