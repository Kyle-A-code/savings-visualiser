package main

import (
	"github.com/Kyle-A-code/savings-visualiser/database"
	"github.com/Kyle-A-code/savings-visualiser/initializers"
	"github.com/Kyle-A-code/savings-visualiser/routes"
)

func main() {
	initializers.LoadEnv()
	db := database.GetDatabase()
	routes.Run(db)
}
