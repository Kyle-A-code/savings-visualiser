package routes

import (
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var router = gin.Default()

func Run(db *gorm.DB) {
	router.SetTrustedProxies(nil)
	getRoutes(db)
	bindAddress := os.Getenv("SERVER_ADDR")
	if bindAddress == "" {
		bindAddress = "0.0.0.0:8080"
	}

	_ = router.Run(bindAddress)
}

func getRoutes(db *gorm.DB) {
	AddBucketRoutes(router, db)
	AddTransactionRoutes(router, db)
	AddGoalRoutes(router, db)
}
