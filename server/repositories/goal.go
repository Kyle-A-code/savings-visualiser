package repositories

import (
	"context"
	"errors"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

type GoalRepository struct {
	db         *gorm.DB
	bucketRepo *BucketRepository
}

func NewGoalRepository(db *gorm.DB) *GoalRepository {
	return &GoalRepository{db: db, bucketRepo: NewBucketRepository(db)}
}

func (repo *GoalRepository) GetForBucket(ctx context.Context, bucketID int) (models.Goal, error) {
	goal, err := gorm.G[models.Goal](repo.db).Where("bucket_id = ?", bucketID).First(ctx)
	return goal, err
}

func (repo *GoalRepository) Create(ctx context.Context, goal *models.Goal) error {
	valid, err := repo.validAmount(ctx, goal.Amount, goal.BucketID)
	if err != nil {
		return err
	}
	if valid != true {
		return errors.New("Unable to create goal, invalid amount.")
	}

	err = gorm.G[models.Goal](repo.db).Create(ctx, goal)
	return err
}

func (repo *GoalRepository) Delete(ctx context.Context, id int) (int, error) {
	rowsAffected, err := gorm.G[models.Goal](repo.db).Where("id = ?", id).Delete(ctx)
	return rowsAffected, err
}

func (repo *GoalRepository) Patch(ctx context.Context, goal *models.Goal) (int, error) {
	if goal.ID == 0 {
		return 0, errors.New("goal id must be set")
	}
	if goal.Title == "" {
		return 0, errors.New("title cannot be blank")
	}

	existing, err := gorm.G[models.Goal](repo.db).Where("id = ?", goal.ID).First(ctx)
	if err != nil {
		return 0, err
	}

	valid, err := repo.validAmount(ctx, goal.Amount, existing.BucketID)
	if err != nil {
		return 0, err
	}
	if valid != true {
		return 0, errors.New("Unable to patch goal, invalid amount.")
	}

	result := repo.db.WithContext(ctx).
		Model(&models.Goal{}).
		Where("id = ?", goal.ID).
		Updates(map[string]any{
			"title":  goal.Title,
			"amount": goal.Amount,
		})
	return int(result.RowsAffected), result.Error
}

func (repo *GoalRepository) MarkCompleted(ctx context.Context, id int) (int, error) {
	rows, err := gorm.G[models.Goal](repo.db).
		Where("id = ? AND completed = ?", id, false).
		Update(ctx, "completed", true)
	return rows, err
}

func (repo *GoalRepository) validAmount(ctx context.Context, amount float64, bucketID int) (bool, error) {
	balance, err := repo.bucketRepo.GetBalanceForId(ctx, bucketID)
	if err != nil {
		return false, err
	}
	valid := amount > 0 && amount > balance
	return valid, nil
}
