#!/bin/bash

echo "🧪 MongoDB Connection Test"
echo "=========================="

# Change to the parent directory (face-recognition root)
cd "$(dirname "$0")/.."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python3."
    exit 1
fi

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "🐍 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Using system Python."
fi

# Check if required packages are installed
echo "📦 Checking dependencies..."
python3 -c "import pymongo, bson" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Required packages not found. Installing..."
    pip install pymongo bson
fi

# Run the test
echo "🚀 Running MongoDB connection test..."
python3 test/test_mongodb.py

echo ""
echo "✅ Test completed!"
