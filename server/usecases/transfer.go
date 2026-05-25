package usecases

import (
	"context"
	"errors"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
	"gorm.io/gorm"
)

type TransferUsecase struct {
	db         *gorm.DB
	bucketRepo *repositories.BucketRepository
}

func NewTransferUsecase(db *gorm.DB) *TransferUsecase {
	return &TransferUsecase{
		db:         db,
		bucketRepo: repositories.NewBucketRepository(db),
	}
}

func (usecase *TransferUsecase) Execute(ctx context.Context, fromBucketID int, toBucketID int, amount float64) error {
	if amount <= 0.0 {
		return errors.New("amount must be positive")
	}
	if fromBucketID == toBucketID {
		return errors.New("Cannot transfer to same bucket")
	}

	fromBucket, err := usecase.bucketRepo.GetById(ctx, fromBucketID)
	if err != nil {
		return err
	}

	toBucket, err := usecase.bucketRepo.GetById(ctx, toBucketID)
	if err != nil {
		return err
	}

	return usecase.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txRepo := repositories.NewTransactionRepository(tx)
		debit := &models.Transaction{
			Title:    "Transfer to " + toBucket.Title,
			Amount:   -amount,
			BucketID: fromBucketID,
		}
		if err := txRepo.Create(ctx, debit); err != nil {
			return err
		}
		credit := &models.Transaction{
			Title:    "Transfer from " + fromBucket.Title,
			Amount:   amount,
			BucketID: toBucketID,
		}
		if err := txRepo.Create(ctx, credit); err != nil {
			return err
		}
		return nil
	})
}
