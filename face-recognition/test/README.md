# Test Suite for Face Recognition API

This folder contains test scripts to validate different components of the face recognition system.

## Available Tests

### 1. MongoDB Connection Tests

#### `test_mongodb.py` - Comprehensive Test Suite

Complete test suite for MongoDB operations including:

-   Connection testing
-   Database and collection validation
-   CRUD operations testing
-   Image collection specific tests

**Usage:**

```bash
# From face-recognition root directory
python test/test_mongodb.py
```

#### `debug_mongo.py` - Quick Debug Tool

Quick diagnostic tool to check MongoDB connection and find image IDs.

**Usage:**

```bash
# From face-recognition root directory
python test/debug_mongo.py
```

#### `run_mongodb_test.sh` - Automated Test Runner

Bash script that automatically sets up environment and runs tests.

**Usage:**

```bash
# From face-recognition root directory
chmod +x test/run_mongodb_test.sh
./test/run_mongodb_test.sh

# Or from test directory
cd test
chmod +x run_mongodb_test.sh
./run_mongodb_test.sh
```

### 2. Face Detection Tests

#### `test_insightface.py` - InsightFace Model Testing

Tests for the InsightFace face detection model.

## Test Results Interpretation

### MongoDB Tests

-   ✅ **Connection PASS**: MongoDB is accessible
-   ✅ **Images Collection PASS**: Collection exists with valid documents
-   ✅ **Query Operations PASS**: Can successfully query specific images
-   ✅ **CRUD Operations PASS**: Can create, read, update, delete documents

### Common Issues and Solutions

#### "Image not found" Error

1. Run `debug_mongo.py` to check available image IDs
2. Verify collection name is correct (`images`)
3. Check ObjectId format (24 hex characters)
4. Ensure database connection is working

#### Connection Failed

1. Check MongoDB URI in environment variables
2. Verify MongoDB server is running
3. Check network connectivity
4. Validate credentials

## Environment Requirements

-   Python 3.7+
-   pymongo
-   bson
-   fastapi (for HTTP exception handling)

## Running All Tests

```bash
# From face-recognition root directory
python test/test_mongodb.py
python test/debug_mongo.py
python test/test_insightface.py
```

## Output Examples

### Successful MongoDB Test

```
🧪 Testing MongoDB Connection...
✅ MongoDB client obtained successfully
✅ MongoDB server ping successful
📋 Available databases: ['admin', 'config', 'portfolio-db']
🎯 Current database: portfolio-db
📚 Available collections: ['images', 'users']
```

### Debug Output

```
🔍 Quick MongoDB Debug
📍 Database: portfolio-db
📚 Collections: ['images']
🖼️  Images count: 5
📋 Sample images:
  1. 685b74e7961a92e9ec1d2a29 -> face-recognition/uuid-filename.jpg
```

### 3. Milvus Face Recognition Tests

#### `test_milvus_faces.py` - Vector Database Tests

Complete test suite for Milvus face recognition integration:

-   Milvus connection testing
-   Face embedding save/search operations
-   Person registration and identification
-   Complete face recognition workflow

**Usage:**

```bash
# From face-recognition root directory
python test/test_milvus_faces.py
```

**Test Coverage:**

-   ✅ **Connection Test**: Milvus vector database connectivity
-   ✅ **Save Face**: Store face embeddings with metadata
-   ✅ **Search Faces**: Vector similarity search for face matching
-   ✅ **Person Registration**: Register new person with face data
-   ✅ **Complete Workflow**: End-to-end face recognition process

**Expected Output:**

```
🧪 Milvus Face Recognition Test Suite
==============================
🔗 Testing Milvus Connection...
✅ Milvus connected successfully
📊 Collection: face_embeddings

💾 Testing Face Saving...
✅ Face saved successfully with ID: uuid-generated

🔍 Testing Face Search...
✅ Search completed. Found 3 similar faces
  1. John Doe (similarity: 0.923)
  2. Jane Smith (similarity: 0.847)
```

### 4. Face Detection Tests
