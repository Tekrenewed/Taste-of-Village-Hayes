package integrations

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"restaurant-os/internal/models"
)

// Client handles the Dojo Cloud API integration
type Client struct {
	BaseURL string
	APIKey  string
}

// NewClient initializes the Dojo Cloud Payment client
func NewClient() *Client {
	baseURL := os.Getenv("DOJO_API_URL")
	if baseURL == "" {
		baseURL = "https://api.dojo.tech/v1"
	}

	return &Client{
		BaseURL: baseURL,
		APIKey:  os.Getenv("DOJO_API_KEY"),
	}
}

// PaymentIntentRequest is the payload required by Dojo
type PaymentIntentRequest struct {
	Amount     int64  `json:"amount"` // In the smallest currency unit (e.g., pence)
	Reference  string `json:"reference"`
	TerminalID string `json:"terminalId"`
}

// PaymentIntentResponse contains the returned intent ID
type PaymentIntentResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

// CreatePaymentIntent initiates a transaction on the physical card terminal
func (c *Client) CreatePaymentIntent(order models.InternalOrder, terminalID string) (string, error) {
	// Dojo requires amounts in pence (e.g., £14.99 -> 1499)
	amountInPence := int64(order.GrossTotal * 100)

	reqBody := PaymentIntentRequest{
		Amount:     amountInPence,
		Reference:  order.ID.String(),
		TerminalID: terminalID, // The specific serial number of the Dojo machine at the counter
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal dojo request: %w", err)
	}

	url := fmt.Sprintf("%s/payment-intents", c.BaseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Authorization", "Basic "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("dojo api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("dojo rejected payment intent with status: %d", resp.StatusCode)
	}

	var dojoResp PaymentIntentResponse
	if err := json.NewDecoder(resp.Body).Decode(&dojoResp); err != nil {
		return "", fmt.Errorf("failed to decode dojo response: %w", err)
	}

	return dojoResp.ID, nil
}
