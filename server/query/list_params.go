package query

const defaultListLimit = 50

type ListParams struct {
	Limit  int
	Offset int
	Order  *string
	Filter *map[string]string
}

func DefaultListParams() ListParams {
	return ListParams{
		Limit:  defaultListLimit,
		Offset: 0,
	}
}
