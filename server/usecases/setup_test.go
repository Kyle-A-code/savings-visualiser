package usecases

import (
	"os"
	"testing"

	"github.com/Kyle-A-code/savings-visualiser/internal/testutil"
)

func TestMain(m *testing.M) {
	os.Exit(testutil.RunTests(m))
}
