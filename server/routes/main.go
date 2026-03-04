package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var router = gin.Default()

func Run(db *gorm.DB) {
	getRoutes(db)
	_ = router.Run("localhost:8080")
}

func getRoutes(db *gorm.DB) {
	AddBucketRoutes(router, db)
}
