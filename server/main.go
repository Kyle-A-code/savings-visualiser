package main

import (
	"github.com/Kyle-A-code/savings-visualiser/database"
	"github.com/Kyle-A-code/savings-visualiser/routes"
)

func main() {
	db := database.GetDatabase()
	routes.Run(db)
}
