package routes

import (
	"github.com/Kyle-A-code/savings-visualiser/handlers"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddGoalRoutes(router *gin.Engine, db *gorm.DB) {
	goals := router.Group("/buckets/:id/goal")
	goalRepository := repositories.NewGoalRepository(db)

	goals.POST("", handlers.CreateBucketGoal(goalRepository))
	goals.PATCH("", handlers.PatchBucketGoal(goalRepository))
	goals.DELETE("", handlers.DeleteBucketGoal(goalRepository))
}
