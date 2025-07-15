#!/bin/bash

# Portfolio Test Runner
# Shortcut script để chạy tests dễ dàng

echo "🧪 Portfolio Test Shortcuts"
echo "=========================="

case $1 in
  "all"|"")
    echo "Running all tests..."
    node test/run-all-tests.js
    ;;
  "mongo"|"db")
    echo "Testing MongoDB..."
    node test/test-mongo.js
    ;;
  "supabase"|"storage")
    echo "Testing Supabase..."
    node test/test-supabase-connection.js
    ;;
  "upload"|"file")
    echo "Testing Upload..."
    node test/test-upload.js
    ;;
  "jwt"|"auth")
    echo "Testing JWT..."
    node test/test-jwt-functionality.js
    ;;
  "help"|"-h"|"--help")
    echo ""
    echo "Usage: ./test.sh [command]"
    echo ""
    echo "Commands:"
    echo "  all, (empty)     - Run all tests"
    echo "  mongo, db        - Test MongoDB connection"
    echo "  supabase, storage - Test Supabase connection"
    echo "  upload, file     - Test file upload functionality"
    echo "  jwt, auth        - Test JWT functionality"
    echo "  help             - Show this help"
    echo ""
    ;;
  *)
    echo "❌ Unknown command: $1"
    echo "Run './test.sh help' for available commands"
    exit 1
    ;;
esac
