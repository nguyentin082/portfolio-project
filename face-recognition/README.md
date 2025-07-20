## Prerequisites

-   Python 3.11+
-   MongoDB instance
-   Supabase account and storage bucket
-   Milvus database instance

## Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd face-recognition
    ```

2. **Create virtual environment**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install dependencies**

    ```bash
    pip install -r requirements.txt
    ```

4. **Environment Configuration**

    Create a `.env` file in the root directory with the following variables:

    ```env
    # MongoDB Configuration
    MONGODB_KEY=mongodb+srv://username:password@cluster.mongodb.net/
    MONGODB_DB_NAME=face_recognition_db

    # Supabase Configuration
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_KEY=your-supabase-anon-key
    SUPABASE_BUCKET_NAME=your-bucket-name

    # Milvus Configuration
    MILVUS_USER=your-milvus-username
    MILVUS_PASSWORD=your-milvus-password
    MILVUS_PUBLIC_ENDPOINT=https://your-milvus-endpoint
    ```

5. **Starting the Server**

    Run the application using uvicorn:

    ```bash
    uvicorn app:app --host 0.0.0.0 --port 8080 --reload
    ```

    Or use the direct Python command:

    ```bash
    python app.py
    ```

    The API will be available at `http://localhost:8080`

## Usage

### API Documentation

Visit `http://localhost:8080/docs` for interactive API documentation (Swagger UI).

### Testing the API

1. **Health Check**

    ```bash
    curl http://localhost:8080/
    ```

2. **Upload an image**

    ```bash
    curl -X POST "http://localhost:8080/api/supabase/upload" \
      -H "Content-Type: multipart/form-data" \
      -F "file=@path/to/your/image.jpg"
    ```

3. **Detect faces**
    ```bash
    curl -X POST "http://localhost:8080/api/face/detect?file_key=your-file-key"
    ```
