package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gridlock/backend/models"
	"github.com/gridlock/backend/services"
)

func Predict(c *gin.Context) {
	var req models.PredictRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := services.Infer(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func GetMeta(c *gin.Context) {
	meta, err := services.GetMeta()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, meta)
}
