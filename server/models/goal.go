package models

import "time"

type Goal struct {
	ID        uint
	Title     string  `gorm:"not null"`
	Amount    float64 `gorm:"not null;check:amount >= 0"`
	Completed bool    `gorm:"not null;default:false"`
	BucketID  int     `gorm:"not null;uniqueIndex"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
