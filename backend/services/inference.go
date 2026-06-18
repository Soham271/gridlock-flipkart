package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gridlock/backend/models"
)

var httpClient = &http.Client{Timeout: 15 * time.Second}

func sidecarURL() string {
	if url := os.Getenv("SIDECAR_URL"); url != "" {
		return url
	}
	return "http://localhost:8001"
}

// Infer sends the prediction request to the Python sidecar
func Infer(req models.PredictRequest) (*models.PredictResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal error: %w", err)
	}

	resp, err := httpClient.Post(sidecarURL()+"/infer", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("sidecar unreachable: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sidecar error %d: %s", resp.StatusCode, string(raw))
	}

	var result models.PredictResponse
	if err := json.Unmarshal(raw, &result); err != nil {
		return nil, fmt.Errorf("unmarshal error: %w", err)
	}
	return &result, nil
}

// GetMeta fetches corridors / police stations / zones from sidecar
func GetMeta() (*models.MetaResponse, error) {
	resp, err := httpClient.Get(sidecarURL() + "/meta")
	if err != nil {
		return nil, fmt.Errorf("ML service unavailable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		raw, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf(
			"sidecar error %d: %s",
			resp.StatusCode,
			string(raw),
		)
	}

	var meta models.MetaResponse
	if err := json.NewDecoder(resp.Body).Decode(&meta); err != nil {
		return nil, fmt.Errorf("decode meta response: %w", err)
	}

	return &meta, nil
}
