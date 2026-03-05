package api

import (
	"encoding/json"
	"log"
	"net/http"
	"restaurant-os/internal/models"
	"restaurant-os/pkg/calculator"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Server encapsulates all dependencies required by the HTTP handlers
type Server struct {
	DB  *sqlx.DB
	Hub *Hub
}

// HandleCreateOrder processes standard POS, Web, or Kiosk orders
func (s *Server) HandleCreateOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var order models.InternalOrder
	if err := json.NewDecoder(r.Body).Decode(&order); err != nil {
		http.Error(w, "Invalid order format: "+err.Error(), http.StatusBadRequest)
		return
	}

	// 1. Calculate Totals using UK Tax Logic
	summary := calculator.CalculateFinance(order.Items, order.ApplyServiceCharge)

	// Update the order with calculated sums
	order.ID = uuid.New()
	order.NetTotal = summary.NetTotal
	order.VATTotal = summary.VATTotal
	order.ServiceCharge = summary.ServiceCharge
	order.GrossTotal = summary.GrossTotal
	order.Status = "kitchen" // Default to sending to kitchen once processed
	order.CreatedAt = time.Now()

	// 2. Save Order to Database (mocked fallback if DB is nil for dev)
	if s.DB != nil {
		tx, err := s.DB.Beginx()
		if err != nil {
			log.Printf("Database error on begin tx: %v", err)
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		// Insert Main Order Record
		insertOrderQuery := `
			INSERT INTO orders (id, store_id, order_source, net_total, vat_total, service_charge, gross_total, status, created_at)
			VALUES (:id, :store_id, :order_source, :net_total, :vat_total, :service_charge, :gross_total, :status, :created_at)
		`
		if _, err := tx.NamedExec(insertOrderQuery, &order); err != nil {
			log.Printf("Failed to insert main order: %v\nOrder data: %+v", err, order)
			tx.Rollback()
			http.Error(w, "Failed to save order", http.StatusInternalServerError)
			return
		}

		// Insert Individual Items
		for _, item := range order.Items {
			item.ID = uuid.New()
			item.OrderID = order.ID
			insertItemQuery := `
				INSERT INTO order_items (id, order_id, product_id, name, price_paid, is_takeaway, vat_rate)
				VALUES (:id, :order_id, :product_id, :name, :price_paid, :is_takeaway, :vat_rate)
			`
			if _, err := tx.NamedExec(insertItemQuery, &item); err != nil {
				log.Printf("Failed to insert order item: %v\nItem data: %+v", err, item)
				tx.Rollback()
				http.Error(w, "Failed to save order item", http.StatusInternalServerError)
				return
			}
		}

		if err := tx.Commit(); err != nil {
			log.Printf("Failed to commit transaction: %v", err)
			http.Error(w, "Transaction commit failed", http.StatusInternalServerError)
			return
		}
	}

	// 3. Broadcast directly to the KDS WebSockets immediately after saving
	// The Hub targets only the screens belonging to `order.StoreID`
	s.Hub.Broadcast <- order

	// 4. Return Full Summary back to the Kiosk or POS client so they can print receipts
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(summary)
}
