package repositories

import (
	"github.com/Kyle-A-code/savings-visualiser/query"
	"gorm.io/gorm"
)

func paginate(params query.ListParams) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		defaultParams := query.DefaultListParams()

		limit := params.Limit
		if limit <= 0 {
			limit = defaultParams.Limit
		}

		offset := params.Offset
		if offset < 0 {
			offset = defaultParams.Offset
		}

		return db.Limit(limit).Offset(offset)
	}
}
