package api

import (
	"encoding/json"
	"net/http"
	"strings"
)

// ProductResponse maps to the global catalog of products
type ProductResponse struct {
	ID        string  `json:"id" db:"id"`
	BrandID   string  `json:"brand_id" db:"brand_id"`
	Name      string  `json:"name" db:"name"`
	Category  string  `json:"category" db:"category"`
	BasePrice float64 `json:"base_price" db:"base_price"`
}

// StoreMenuResponse maps the specific price overrides and availability for a store and channel
type StoreMenuResponse struct {
	ProductID   string  `json:"product_id" db:"product_id"`
	ProductName string  `json:"product_name" db:"product_name"`
	Category    string  `json:"category" db:"category"`
	ChannelName string  `json:"channel_name" db:"channel_name"` // e.g. "Dine-In", "UberEats"
	FinalPrice  float64 `json:"final_price" db:"final_price"`
	IsActive    bool    `json:"is_active" db:"active_status"`
}

// HandleGetCatalog returns all products across all brands (Universal Menu)
func (s *Server) HandleGetCatalog(w http.ResponseWriter, r *http.Request) {
	if s.DB == nil {
		// Mock response if no DB attached
		mock := []ProductResponse{
			{ID: "1", BrandID: "TasteOfVillage", Name: "Chicken Tikka Masala", Category: "Curry", BasePrice: 10.99},
			{ID: "2", BrandID: "Azmoz", Name: "Peri Peri Half Chicken", Category: "Grill", BasePrice: 8.99},
			{ID: "3", BrandID: "FaloodAndCo", Name: "Mango Falooda", Category: "Dessert", BasePrice: 6.99},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(mock)
		return
	}

	var catalog []ProductResponse
	// We'll join against product_prices for the default Dine-In pricing (price_level_id = 1) assuming 1 is Dine-In
	query := `
		SELECT 
			p.id, 
			p.brand_id, 
			p.name, 
			p.category, 
			COALESCE(MAX(pp.price_amount), 0) as base_price 
		FROM products p
		LEFT JOIN product_prices pp ON p.id = pp.product_id
		GROUP BY p.id, p.brand_id, p.name, p.category
		ORDER BY p.category, p.name
	`
	
	if err := s.DB.Select(&catalog, query); err != nil {
		http.Error(w, "Failed to fetch catalog: " + err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(catalog)
}

// HandleGetStoreMenu returns the channel-specific pricing and availability for a specific store
func (s *Server) HandleGetStoreMenu(w http.ResponseWriter, r *http.Request) {
	// Extract storeID from URL path, e.g., /api/v1/stores/{id}/menu
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 5 {
		http.Error(w, "Invalid store ID", http.StatusBadRequest)
		return
	}
	storeID := parts[4]

	if s.DB == nil {
		// Mock response if no DB attached
		mock := []StoreMenuResponse{
			{ProductID: "1", ProductName: "Chicken Tikka Masala", Category: "Curry", ChannelName: "Dine-In", FinalPrice: 10.99, IsActive: true},
			{ProductID: "1", ProductName: "Chicken Tikka Masala", Category: "Curry", ChannelName: "UberEats", FinalPrice: 13.99, IsActive: true},
			{ProductID: "3", ProductName: "Mango Falooda", Category: "Dessert", ChannelName: "Dine-In", FinalPrice: 6.99, IsActive: true},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(mock)
		return
	}

	// CTE query to merge base products with store-specific price overrides
	query := `
		WITH StoreMenu AS (
			SELECT 
				p.id AS product_id,
				p.name AS product_name,
				p.category,
				pl.name AS channel_name,
				COALESCE(pp.price_amount, 0) AS final_price,  -- Assume pp has actual price override
				COALESCE(pp.is_active, true) AS active_status
			FROM products p
			CROSS JOIN price_levels pl
			LEFT JOIN product_prices pp ON p.id = pp.product_id 
				AND pp.store_id = $1 
				AND pl.id = pp.price_level_id
			WHERE p.brand_id = (SELECT brand_id FROM stores WHERE id = $1)
		)
		SELECT * FROM StoreMenu ORDER BY category, product_name;
	`

	var menu []StoreMenuResponse
	if err := s.DB.Select(&menu, query, storeID); err != nil {
		http.Error(w, "Failed to fetch store menu: " + err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(menu)
}
