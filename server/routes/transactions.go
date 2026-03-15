package routes

import (
	"github.com/Kyle-A-code/savings-visualiser/handlers"
	"github.com/Kyle-A-code/savings-visualiser/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AddTransactionRoutes(router *gin.Engine, db *gorm.DB) {
	transactions := router.Group("/transactions")
	transactionRepository := repositories.NewTransactionRepository(db)

	transactions.GET("", handlers.GetTransactions(transactionRepository))
	transactions.GET("/:id", handlers.GetTransactionById(transactionRepository))
	transactions.GET("/bucket/:id", handlers.GetTransactionsForBucket(transactionRepository))
	transactions.POST("", handlers.CreateTransaction(transactionRepository))
	transactions.POST("/transfer", handlers.TransferTransaction(transactionRepository))
	transactions.PATCH("/:id", handlers.PatchTransaction(transactionRepository))
	transactions.DELETE("/:id", handlers.DeleteTransactionByID(transactionRepository))
}
