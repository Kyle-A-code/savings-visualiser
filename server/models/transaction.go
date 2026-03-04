package models

import (
	"time"
)

type Transaction struct {
	ID        uint
	Amount    float64   `gorm:"not null"`
	Date      time.Time `gorm:"not null"`
	BucketId  int
	Bucket    Bucket
	CreatedAt time.Time
	UpdatedAt time.Time
}
