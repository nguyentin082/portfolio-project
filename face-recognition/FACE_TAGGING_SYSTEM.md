# Face Tagging System với Milvus

## 🎯 Mục đích

Hệ thống gợi ý tag tên cho gương mặt trong ảnh sử dụng Milvus vector database để tìm kiếm similarity.

## 🏗️ Architecture

```
Image → Face Detection → Name Suggestions (Milvus) → User Tags Face → Save to Database
```

## 📊 Core Features

### 1. **Face Detection**

-   Detect faces trong ảnh sử dụng InsightFace
-   Trích xuất embeddings 512-dimensional cho mỗi face

### 2. **Name Suggestions**

-   Search similar faces trong Milvus database
-   Gợi ý tên based on similarity score
-   Group suggestions by person name

### 3. **Face Tagging**

-   User tag face với tên person
-   Save face embedding + metadata vào Milvus
-   Update MongoDB với face metadata

## 🚀 API Endpoints

### 1. Basic Face Detection

```bash
POST /faces/detect
{
    "image_id": "mongo_image_id"
}
```

**Response:**

```json
{
    "success": true,
    "faces": [...raw face data...],
    "execution_time": 2.45
}
```

### 2. Face Detection với Name Suggestions (Main Feature)

```bash
POST /faces/suggest-tags
{
    "image_id": "mongo_image_id"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Detected 2 faces with name suggestions",
    "faces": [
        {
            "face_index": 0,
            "bbox": [897.22, 343.30, 940.63, 401.90],
            "confidence": 0.89,
            "name_suggestions": [
                {
                    "name": "John Doe",
                    "similarity_score": 0.92,
                    "face_count": 3
                },
                {
                    "name": "Jane Smith",
                    "similarity_score": 0.85,
                    "face_count": 1
                }
            ],
            "embedding": [...512 dims...]
        }
    ],
    "total_faces": 2,
    "execution_time": 3.21
}
```

### 3. Tag Face với Name

```bash
POST /faces/tag-face
{
    "image_id": "mongo_image_id",
    "person_name": "John Doe",
    "face_data": {
        "bbox": [897.22, 343.30, 940.63, 401.90],
        "embedding": [...],
        "det_score": 0.89
    }
}
```

**Response:**

```json
{
    "success": true,
    "message": "Face tagged as 'John Doe' successfully",
    "face_id": "uuid-generated"
}
```

### 4. Get Name Suggestions cho Embedding

```bash
POST /faces/suggest-names?top_k=5
[...face embedding array...]
```

## 💡 Workflow

### User Tagging Process:

1. **Upload ảnh** → MongoDB tạo record
2. **Call `/suggest-tags`** → Nhận face detection + name suggestions
3. **User chọn name** hoặc nhập name mới
4. **Call `/tag-face`** → Save tagged face vào Milvus
5. **Lần sau** → System sẽ suggest name đó cho similar faces

### Example Usage:

```python
# 1. Detect faces và get suggestions
response = await client.post("/faces/suggest-tags",
    json={"image_id": "123"})

faces = response.json()["faces"]

# 2. User tags first face
await client.post("/faces/tag-face", json={
    "image_id": "123",
    "person_name": "John Doe",
    "face_data": faces[0]  # Use detected face data
})

# 3. Next time similar face → "John Doe" suggestion
```

## ⚙️ Configuration

### Similarity Threshold

```python
# services/milvus_face_service.py
self.similarity_threshold = 0.8  # Higher = more strict matching
```

### Top Suggestions

```python
# Default top 5 name suggestions
suggestions = await suggest_face_names_service(embedding, top_k=5)
```

## 🎯 Key Benefits

1. **Simple workflow**: Detect → Suggest → Tag → Learn
2. **Smart suggestions**: Tự động gợi ý based on previous tags
3. **High similarity threshold**: Chỉ suggest khi confidence cao
4. **Scalable**: Milvus vector search performance cao
5. **User-friendly**: Workflow đơn giản cho end users

## 📝 Database Schema

### Milvus Collection: `face_embeddings`

```python
{
    "id": "uuid",                    # Unique face ID
    "image_id": "mongo_id",          # Source image
    "person_id": "person_john_doe",  # Person identifier
    "person_name": "John Doe",       # Display name
    "bbox": [x1, y1, x2, y2],       # Face coordinates
    "embedding": [...512 dims...],   # Face vector
    "det_score": 0.89,              # Detection confidence
    "created_at": "2025-07-15T..."   # Timestamp
}
```

## 🧪 Testing

```bash
# Test name suggestion system
cd face-recognition
python test/test_milvus_faces.py

# Test với real image
curl -X POST "http://localhost:8000/faces/suggest-tags" \
  -H "Content-Type: application/json" \
  -d '{"image_id": "685b74e7961a92e9ec1d2a29"}'
```

Hệ thống này focus vào **user experience** - giúp user dễ dàng tag faces và system học từ những tags đó để gợi ý cho lần sau! 🎯
