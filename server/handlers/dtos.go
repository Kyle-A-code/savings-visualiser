package handlers

import (
	"time"

	"github.com/Kyle-A-code/savings-visualiser/models"
)

type GoalResponseDTO struct {
	ID        uint    `json:"id"`
	Title     string  `json:"title"`
	Amount    float64 `json:"amount"`
	Completed bool    `json:"completed"`
	BucketID  int     `json:"bucketId"`
}

type BucketResponseDTO struct {
	ID        uint             `json:"id"`
	Title     string           `json:"title"`
	Balance   float64          `json:"balance"`
	Goal      *GoalResponseDTO `json:"goal,omitempty"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
}

type TransactionResponseDTO struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Amount    float64   `json:"amount"`
	Date      time.Time `json:"date"`
	BucketID  int       `json:"bucketId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type ErrorResponseDTO struct {
	Error string `json:"error"`
}

func newBucketResponseDTO(bucket models.Bucket) BucketResponseDTO {
	var goal *GoalResponseDTO
	if bucket.Goal != nil {
		goalDTO := newGoalResponseDTO(*bucket.Goal)
		goal = &goalDTO
	}

	return BucketResponseDTO{
		ID:        bucket.ID,
		Title:     bucket.Title,
		Balance:   bucket.Balance,
		Goal:      goal,
		CreatedAt: bucket.CreatedAt,
		UpdatedAt: bucket.UpdatedAt,
	}
}

func newGoalResponseDTO(goal models.Goal) GoalResponseDTO {
	return GoalResponseDTO{
		ID:        goal.ID,
		Title:     goal.Title,
		Amount:    goal.Amount,
		Completed: goal.Completed,
		BucketID:  goal.BucketID,
	}
}

func newTransactionResponseDTO(transaction models.Transaction) TransactionResponseDTO {
	return TransactionResponseDTO{
		ID:        transaction.ID,
		Title:     transaction.Title,
		Amount:    transaction.Amount,
		Date:      transaction.Date,
		BucketID:  transaction.BucketID,
		CreatedAt: transaction.CreatedAt,
		UpdatedAt: transaction.UpdatedAt,
	}
}

func newErrorResponse(message string) ErrorResponseDTO {
	return ErrorResponseDTO{Error: message}
}

func newBucketResponseDTOs(buckets []models.Bucket) []BucketResponseDTO {
	items := make([]BucketResponseDTO, 0, len(buckets))
	for _, bucket := range buckets {
		items = append(items, newBucketResponseDTO(bucket))
	}
	return items
}

func newTransactionResponseDTOs(transactions []models.Transaction) []TransactionResponseDTO {
	items := make([]TransactionResponseDTO, 0, len(transactions))
	for _, transaction := range transactions {
		items = append(items, newTransactionResponseDTO(transaction))
	}
	return items
}
