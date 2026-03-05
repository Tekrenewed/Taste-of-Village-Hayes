package database

import (
	"log"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// InitDB initializes the database connection
func InitDB() *sqlx.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Log warning and return nil if running without db during dev/test
		log.Println("DATABASE_URL not set, running without database")
		return nil
	}

	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Could not connect to DB: %v", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test the connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Database is unreachable: %v", err)
	}

	log.Println("Connected to PostgreSQL")
	return db
}
