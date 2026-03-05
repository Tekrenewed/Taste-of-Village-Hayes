package integrations

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"restaurant-os/internal/models"
)

// UberDirectClient handles the white-label dispatch of couriers for the restaurant's own website orders
type UberDirectClient struct {
	BaseURL  string
	ClientID string
	Token    string // Usually acquired via OAuth2 client_credentials flow
}

// NewUberDirectClient initializes the Uber Direct API client
func NewUberDirectClient() *UberDirectClient {
	baseURL := os.Getenv("UBER_DIRECT_API_URL")
	if baseURL == "" {
		baseURL = "https://api.uber.com/v1" // Default production URL
	}

	return &UberDirectClient{
		BaseURL:  baseURL,
		ClientID: os.Getenv("UBER_CLIENT_ID"),
		Token:    os.Getenv("UBER_ACCESS_TOKEN"), // In reality, this requires a token refresh mechanism
	}
}

// UberDeliveryRequest represents the payload to request a courier
type UberDeliveryRequest struct {
	DropoffAddress string `json:"dropoff_address"`
	DropoffName    string `json:"dropoff_name"`
	DropoffPhone   string `json:"dropoff_phone_number"`
	PickupAddress  string `json:"pickup_address"`
	PickupName     string `json:"pickup_name"`
	PickupPhone    string `json:"pickup_phone_number"`
	ManifestItems  []Item `json:"manifest_items"`
}

type Item struct {
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
}

// DispatchCourier calls Uber Direct API to send a driver to the configured 'storeID' for the customer
func (c *UberDirectClient) DispatchCourier(order models.InternalOrder, customerName, customerPhone, customerAddress string) error {
	// 1. Build the manifest from our internal order items
	var manifest []Item
	for _, item := range order.Items {
		// Group items or just send flat for simplicity
		manifest = append(manifest, Item{
			Name:     item.Name,
			Quantity: 1,
		})
	}

	// 2. Lookup Restaurant details based on order.StoreID
	// For now, we use placeholders representing the physical branch (e.g., Taste of Village Hayes or Azmoz)
	pickupAddress := "123 High Street, Hayes, UB3 1XX" // TODO: Fetch from DB `stores` table
	pickupName := "Azmoz / Taste of Village"
	pickupPhone := "+44 20 1234 5678"

	// 3. Construct Payload
	reqBody := UberDeliveryRequest{
		DropoffAddress: customerAddress,
		DropoffName:    customerName,
		DropoffPhone:   customerPhone,
		PickupAddress:  pickupAddress,
		PickupName:     pickupName,
		PickupPhone:    pickupPhone,
		ManifestItems:  manifest,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal uber direct request: %w", err)
	}

	// 4. Send the HTTP POST to Uber Direct
	url := fmt.Sprintf("%s/customers/%s/deliveries", c.BaseURL, c.ClientID)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.Token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("uber direct api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("uber direct rejected request with status: %d", resp.StatusCode)
	}

	// Successfully dispatched driver
	return nil
}
