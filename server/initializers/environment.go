package initializers

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	if _, err := os.Stat(".env"); err != nil {
		if os.IsNotExist(err) {
			return
		}

		log.Fatalf("Error checking .env file: %v", err)
	}

	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
}
