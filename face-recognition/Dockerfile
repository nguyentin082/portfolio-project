FROM python:3.11-slim

RUN apt-get update && apt-get install g++ ffmpeg libsm6 libxext6 build-essential libssl-dev libffi-dev python3-dev -y

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]