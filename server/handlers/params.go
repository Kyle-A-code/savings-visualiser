package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func parseIDParam(c *gin.Context) (int, error) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return 0, err
	}
	return id, nil
}
