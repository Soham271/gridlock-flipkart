package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gridlock/backend/handlers"
)

func main() {
	r := gin.Default()

	// CORS — allow Next.js dev + prod
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		api.GET("/health",  handlers.Health)
		api.POST("/predict", handlers.Predict)
		api.GET("/meta",    handlers.GetMeta)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("ASTRAM Gridlock API running on :%s", port)
	r.Run(":" + port)
}
