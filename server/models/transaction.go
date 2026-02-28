package models

import (
	"time"
	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model
	Amount   float64   `gorm:"not null"`
	Date     time.Time `gorm:"not null"`
	BucketId int
	Bucket Bucket
}