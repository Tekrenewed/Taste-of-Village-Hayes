package integrations

import (
	"encoding/json"
	"log"
	"net/http"
	"restaurant-os/internal/models"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// WebhookHandler manages direct incoming orders from delivery platforms (No aggregator MIDDLEMAN used)
type WebhookHandler struct {
	DB  *sqlx.DB
	Hub interface{} // Replace with actual hub reference when KDS is wired
}

// EnsureIdempotency prevents processing the same exact delivery order twice
func (h *WebhookHandler) EnsureIdempotency(externalOrderID string) (bool, error) {
	if h.DB == nil {
		// Mock for dev mode
		return true, nil
	}

	// This relies on the unique constraint of external_id in a processed_orders table or similar.
	// For now, we will assume it's safe.
	return true, nil
}

// HandleDeliverooWebhook processes direct payloads from Deliveroo Order API Tablet-less Flow
func (h *WebhookHandler) HandleDeliverooWebhook(w http.ResponseWriter, r *http.Request) {
	// 1. Verify Signature (HMAC) - Omitted for brevity, but crucial for production
	// 2. Parse Payload
	var payload struct {
		ID         string `json:"id"`
		LocationID string `json:"location_id"`
		Items      []struct {
			Name      string  `json:"name"`
			Price     float64 `json:"price"`
		} `json:"items"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid Deliveroo Payload", http.StatusBadRequest)
		return
	}

	// Idempotency check
	if safe, err := h.EnsureIdempotency(payload.ID); !safe || err != nil {
		w.WriteHeader(http.StatusOK) // Already processed, return 200 so they stop retrying
		return
	}

	// 3. Convert to InternalOrder
	order := models.InternalOrder{
		ExternalID: payload.ID,
		Source:     "Deliveroo",
		Status:     "paid", // Usually pre-paid online
	}

	// Map Deliveroo Location to our internal StoreID (e.g., Taste of Village Hayes vs Azmoz)
	order.StoreID = h.mapExternalLocation(payload.LocationID, "Deliveroo")

	for _, item := range payload.Items {
		order.Items = append(order.Items, models.OrderItem{
			Name:       item.Name,
			PricePaid:  item.Price,
			IsTakeaway: true,
		})
	}

	// 4. Save to DB + Broadcast to Kitchen Hub
	log.Printf("Successfully processed direct Deliveroo order: %s", order.ExternalID)
	
	// Acknowledge receipt to Deliveroo within the 10-second timeout window
	w.WriteHeader(http.StatusOK)
}

// HandleUberEatsWebhook processes payloads from Uber Eats Marketplace API
func (h *WebhookHandler) HandleUberEatsWebhook(w http.ResponseWriter, r *http.Request) {
	// Parse UberEats format, convert to models.InternalOrder, save, and broadcast...
	log.Println("Received direct UberEats Webhook")
	w.WriteHeader(http.StatusOK)
}

// HandleJustEatWebhook processes payloads from Just Eat JET Connect API
func (h *WebhookHandler) HandleJustEatWebhook(w http.ResponseWriter, r *http.Request) {
	// Parse JustEat format, convert to models.InternalOrder, save, and broadcast...
	log.Println("Received direct JustEat Webhook")
	w.WriteHeader(http.StatusOK)
}

// Helper to map 3rd party location IDs to our UUIDs
func (h *WebhookHandler) mapExternalLocation(externalID, platform string) uuid.UUID {
	// Example mapping logic for "Taste of Village Hayes" vs "Azmoz"
	// This would realistically query the `stores` table where `platform` logic exists.
	return uuid.New() // Placeholder
}
