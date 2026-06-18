package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

func Health(c *gin.Context) {
	sidecar := os.Getenv("SIDECAR_URL")
	if sidecar == "" {
		sidecar = "http://localhost:8001"
	}

	status := "ok"
	sidecarStatus := "ok"

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(sidecar + "/health")
	if err != nil {
		status = "degraded"
		sidecarStatus = "unreachable"
	} else {
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			status = "degraded"
			sidecarStatus = "unhealthy"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":         status,
		"service":        "astram-gridlock-api",
		"sidecar_url":    sidecar,
		"sidecar_status": sidecarStatus,
	})
}
