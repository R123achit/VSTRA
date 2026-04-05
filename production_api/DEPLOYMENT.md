# Deployment Guide

Complete guide for deploying the Product Search API to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Test API locally
- [ ] Configure environment variables
- [ ] Prepare data files (FAISS index, CSV)
- [ ] Set up monitoring
- [ ] Configure CORS for your domain
- [ ] Enable rate limiting
- [ ] Set up logging
- [ ] Test with production data

---

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker installed
- Docker Compose installed
- Data files accessible

### Steps

1. **Prepare Data Files**
```bash
# Create data directory
mkdir -p /app/data

# Copy your files
cp product_index.faiss /app/data/
cp embeddings.npy /app/data/
cp cleaned_products.csv /app/data/
```

2. **Configure Environment**
```bash
# Copy and edit .env
cp .env.example .env
nano .env

# Update paths to point to /app/data/
FAISS_INDEX_PATH=/app/data/product_index.faiss
PRODUCTS_CSV_PATH=/app/data/cleaned_products.csv
```

3. **Build and Run**
```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f api
```

4. **Verify Deployment**
```bash
curl http://localhost:8000/api/v1/health
```

### Production Configuration

Edit `docker-compose.yml`:
```yaml
services:
  api:
    environment:
      - DEBUG=False
      - LOG_LEVEL=INFO
      - WORKERS=4
      - RATE_LIMIT_ENABLED=True
      - CORS_ORIGINS=https://yourfrontend.com
```

---

## ☁️ Render.com Deployment

### Prerequisites
- Render.com account
- GitHub repository
- Data files in repository or external storage

### Steps

1. **Prepare Repository**
```bash
# Add render.yaml
cat > render.yaml << EOF
services:
  - type: web
    name: product-search-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port \$PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: DEBUG
        value: False
      - key: LOG_LEVEL
        value: INFO
EOF
```

2. **Create New Web Service**
- Go to Render Dashboard
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select branch

3. **Configure Service**
- **Name:** product-search-api
- **Environment:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Instance Type:** Standard (or higher for production)

4. **Add Environment Variables**
```
DEBUG=False
LOG_LEVEL=INFO
FAISS_INDEX_PATH=/opt/render/project/src/data/product_index.faiss
PRODUCTS_CSV_PATH=/opt/render/project/src/data/cleaned_products.csv
CORS_ORIGINS=https://yourfrontend.com
RATE_LIMIT_ENABLED=True
```

5. **Upload Data Files**
- Use Render Disks for persistent storage
- Or use external storage (S3, Google Cloud Storage)

6. **Deploy**
- Click "Create Web Service"
- Wait for deployment to complete
- Access at: `https://your-service.onrender.com`

### Render.com Tips
- Use at least Standard instance for production
- Enable auto-deploy from GitHub
- Set up health checks
- Monitor logs in dashboard

---

## 🚂 Railway.app Deployment

### Prerequisites
- Railway account
- GitHub repository

### Steps

1. **Create New Project**
- Go to Railway Dashboard
- Click "New Project"
- Select "Deploy from GitHub repo"

2. **Configure Service**
Railway auto-detects Dockerfile and uses it automatically.

3. **Add Environment Variables**
Go to Variables tab and add:
```
DEBUG=False
LOG_LEVEL=INFO
FAISS_INDEX_PATH=/app/data/product_index.faiss
PRODUCTS_CSV_PATH=/app/data/cleaned_products.csv
CORS_ORIGINS=*
PORT=8000
```

4. **Add Data Files**
- Use Railway Volumes for persistent storage
- Or mount from external storage

5. **Deploy**
- Railway automatically deploys
- Access at generated URL

### Railway Tips
- Use volumes for data files
- Enable health checks
- Set up custom domain
- Monitor metrics in dashboard

---

## ☁️ AWS EC2 Deployment

### Prerequisites
- AWS account
- EC2 instance (t3.medium or larger)
- Security group configured

### Steps

1. **Launch EC2 Instance**
```bash
# Instance type: t3.medium (2 vCPU, 4GB RAM)
# OS: Ubuntu 22.04 LTS
# Storage: 20GB+ SSD
```

2. **Configure Security Group**
```
Inbound Rules:
- SSH (22) from your IP
- HTTP (80) from anywhere
- HTTPS (443) from anywhere
- Custom TCP (8000) from anywhere (or use nginx)
```

3. **Connect and Setup**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

4. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo/production_api

# Copy data files
scp -i your-key.pem product_index.faiss ubuntu@your-ec2-ip:~/data/
scp -i your-key.pem cleaned_products.csv ubuntu@your-ec2-ip:~/data/

# Configure environment
cp .env.example .env
nano .env

# Start services
docker-compose up -d
```

5. **Set Up Nginx (Optional)**
```bash
# Install nginx
sudo apt install nginx -y

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/api

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Set Up SSL (Optional)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com
```

### AWS Tips
- Use Elastic IP for static IP
- Set up CloudWatch for monitoring
- Use S3 for data file storage
- Configure auto-scaling for high traffic
- Set up backup strategy

---

## 🔧 Production Server (Gunicorn)

For bare metal or VPS deployment without Docker.

### Prerequisites
- Python 3.9+
- System dependencies installed

### Steps

1. **Install Dependencies**
```bash
# System packages
sudo apt update
sudo apt install python3-pip python3-venv -y

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
pip install gunicorn
```

2. **Configure Environment**
```bash
cp .env.example .env
nano .env
```

3. **Run with Gunicorn**
```bash
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile - \
  --log-level info
```

4. **Create Systemd Service**
```bash
sudo nano /etc/systemd/system/product-api.service
```

Add:
```ini
[Unit]
Description=Product Search API
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/production_api
Environment="PATH=/home/ubuntu/production_api/venv/bin"
ExecStart=/home/ubuntu/production_api/venv/bin/gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

5. **Start Service**
```bash
sudo systemctl daemon-reload
sudo systemctl start product-api
sudo systemctl enable product-api
sudo systemctl status product-api
```

---

## 📊 Monitoring & Logging

### Application Logs

**Docker:**
```bash
docker-compose logs -f api
```

**Systemd:**
```bash
sudo journalctl -u product-api -f
```

### Health Monitoring

Set up health check monitoring:
```bash
# Cron job for health check
*/5 * * * * curl -f http://localhost:8000/api/v1/health || echo "API Down" | mail -s "API Alert" admin@example.com
```

### Metrics

Use Prometheus + Grafana:
```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
```

---

## 🔒 Security Hardening

### 1. Environment Variables
```bash
# Never commit .env file
echo ".env" >> .gitignore

# Use secrets management in production
# AWS: Secrets Manager
# Azure: Key Vault
# GCP: Secret Manager
```

### 2. CORS Configuration
```python
# In .env
CORS_ORIGINS=https://yourfrontend.com,https://www.yourfrontend.com
```

### 3. Rate Limiting
```python
# In .env
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

### 4. HTTPS
Always use HTTPS in production:
- Use Let's Encrypt for free SSL
- Configure nginx/Apache as reverse proxy
- Enable HSTS headers

### 5. Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🚀 Performance Optimization

### 1. Increase Workers
```bash
# Gunicorn
gunicorn app.main:app -w 8 -k uvicorn.workers.UvicornWorker

# Docker
# Edit docker-compose.yml
command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 2. Enable Caching
```python
# In .env
ENABLE_CACHE=True
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
```

### 3. Use Redis for Distributed Caching
```python
# In .env
REDIS_ENABLED=True
REDIS_URL=redis://localhost:6379
```

### 4. Database Connection Pooling
If using database, configure connection pooling.

### 5. CDN for Static Assets
Use CloudFlare or similar for static content.

---

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer**
```
nginx → API Instance 1
      → API Instance 2
      → API Instance 3
```

2. **Shared Cache**
Use Redis for shared caching across instances.

3. **Shared Storage**
Use S3/GCS for data files.

### Vertical Scaling

Increase instance resources:
- More CPU cores
- More RAM
- Faster storage (SSD)

---

## 🐛 Troubleshooting

### Issue: API won't start
```bash
# Check logs
docker-compose logs api

# Verify data files exist
ls -lh /app/data/

# Test configuration
python -c "from app.core.config import settings; print(settings)"
```

### Issue: Slow responses
```bash
# Check resource usage
docker stats

# Enable caching
# Set ENABLE_CACHE=True in .env

# Increase workers
# Edit docker-compose.yml or gunicorn command
```

### Issue: Out of memory
```bash
# Check memory usage
free -h

# Reduce cache size
# Set CACHE_MAX_SIZE=500 in .env

# Increase server RAM
```

---

## ✅ Post-Deployment Checklist

- [ ] API accessible at public URL
- [ ] Health check returns 200 OK
- [ ] Search endpoint working
- [ ] Logs are being generated
- [ ] Monitoring set up
- [ ] SSL certificate installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Backup strategy in place
- [ ] Documentation updated

---

## 📞 Support

For deployment issues:
1. Check logs first
2. Review configuration
3. Test locally
4. Check firewall/security groups
5. Verify data files are accessible

---

**Happy Deploying! 🚀**
