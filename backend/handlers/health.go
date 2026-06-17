package handlers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func Health(c *gin.Context) {
	sidecar := os.Getenv("SIDECAR_URL")
	if sidecar == "" {
		sidecar = "http://localhost:8001"
	}
	c.JSON(http.StatusOK, gin.H{
		"status":      "ok",
		"service":     "astram-gridlock-api",
		"sidecar_url": sidecar,
	})
}
