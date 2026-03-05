package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"runtime/debug"
	"strings"
	"restaurant-os/internal/api"
	"restaurant-os/internal/database"
	"restaurant-os/internal/integrations"
	"github.com/joho/godotenv"
)

// RecoveryMiddleware ensures that a single bad request doesn't crash the entire server
func RecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("PANIC RECOVERED: %v\n%s", err, debug.Stack())
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// CORSMiddleware allows cross-origin requests from the React frontend
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	// 1. Initialize Database Connection (Mocked safely if no env var exists)
	db := database.InitDB()

	// 2. Initialize Real-Time KDS Hub
	hub := api.NewHub()
	go hub.Run() // Start broadcasting loop

	// 3. Initialize Server Handlers
	server := &api.Server{
		DB:  db,
		Hub: hub,
	}

	webhookHandler := &integrations.WebhookHandler{
		DB:  db,
		Hub: hub, // In reality, we'd need strong decoupling if hub moves to another package
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	
	// API Endpoints
	mux.HandleFunc("/api/v1/health", healthCheckHandler)
	
	// POS & Kiosk Ordering
	mux.HandleFunc("/api/v1/orders", server.HandleCreateOrder) // POST Create Order

	// Admin Control Center (Menu sync)
	mux.HandleFunc("/api/v1/catalog", server.HandleGetCatalog) // GET Global Catalog
	
	// Custom route matching for dynamic ID
	mux.HandleFunc("/api/v1/stores/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/menu") {
			server.HandleGetStoreMenu(w, r)
			return
		}
		http.NotFound(w, r)
	})

	// KDS Sockets (Connected to React Screen)
	mux.HandleFunc("/ws", hub.ServeWs)

	// Direct Delivery Integrations (No Middleman)
	mux.HandleFunc("/webhooks/deliveroo", webhookHandler.HandleDeliverooWebhook)
	mux.HandleFunc("/webhooks/ubereats", webhookHandler.HandleUberEatsWebhook)
	mux.HandleFunc("/webhooks/justeat", webhookHandler.HandleJustEatWebhook)

	// Wrap everything in the Recovery and CORS Middleware for 100% Uptime and browser access
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: CORSMiddleware(RecoveryMiddleware(mux)),
	}

	log.Printf("Restaurant OS backend starting on port %s", port)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
