package handlers

import "github.com/Kyle-A-code/savings-visualiser/query"

type PaginatedResponse[T any] struct {
	Items        []T   `json:"items"`
	TotalRecords int64 `json:"totalRecords"`
	Limit        int   `json:"limit"`
	Offset       int   `json:"offset"`
	CurrentPage  int   `json:"currentPage"`
}

func NewPaginatedResponse[T any](items []T, totalRecords int64, params query.ListParams) PaginatedResponse[T] {
	currentPage := params.Offset/params.Limit + 1

	return PaginatedResponse[T]{
		Items:        items,
		TotalRecords: totalRecords,
		Limit:        params.Limit,
		Offset:       params.Offset,
		CurrentPage:  currentPage,
	}
}
