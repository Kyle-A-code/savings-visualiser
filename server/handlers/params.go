package handlers

import (
	"fmt"
	"strconv"

	"github.com/Kyle-A-code/savings-visualiser/query"
	"github.com/gin-gonic/gin"
)

func parseIDParam(c *gin.Context) (int, error) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return 0, err
	}
	return id, nil
}

func parseListQuery(c *gin.Context) (query.ListParams, error) {
	params := query.DefaultListParams()

	limitQuery := c.Query("limit")
	if limitQuery != "" {
		limit, err := strconv.Atoi(limitQuery)
		if err != nil || limit <= 0 {
			return params, fmt.Errorf("limit must be a positive integer")
		}
		params.Limit = min(limit, 100)
	}

	offsetQuery := c.Query("offset")
	if offsetQuery != "" {
		offset, err := strconv.Atoi(offsetQuery)
		if err != nil || offset < 0 {
			return params, fmt.Errorf("offset must be a non-negative integer")
		}
		params.Offset = offset
	}

	filterMap := c.QueryMap("filter")
	if len(filterMap) > 0 {
		params.Filter = &filterMap
	}

	order := c.Query("order")
	if order != "" {
		params.Order = &order
	}

	return params, nil
}
