# Deployment Guide

Complete guide for deploying the Genius POS to Salesforce Loyalty Integration service.

## Deployment Options

1. [Docker Deployment](#docker-deployment)
2. [PM2 Deployment](#pm2-deployment)
3. [Cloud Platform Deployment](#cloud-platform-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)

---

## Prerequisites

### All Deployments
- Node.js 18+ installed
- Redis 6+ instance
- SSL certificate (required for webhooks)
- Domain name with DNS configured

### Cloud Deployments
- Cloud provider account (AWS, GCP, Azure, etc.)
- CLI tools installed (aws-cli, gcloud, az, etc.)

---

## Docker Deployment

### 1. Build Docker Image

```bash
cd genius-salesforce-loyalty-integration
docker build -t genius-loyalty-integration:latest .
```

### 2. Configure Environment

Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services

```bash
docker-compose up -d
```

This starts:
- Integration service on port 3000
- Redis on port 6379

### 4. Verify Deployment

```bash
# Check containers
docker-compose ps

# Check logs
docker-compose logs -f app

# Health check
curl http://localhost:3000/api/webhooks/health
```

### 5. Production Configuration

For production, use separate Redis and configure SSL:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: genius-loyalty-integration:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=your-redis-host
      - REDIS_PORT=6379
      - REDIS_PASSWORD=your-redis-password
    env_file:
      - .env.production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

---

## PM2 Deployment

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Build Application

```bash
npm install
npm run build
```

### 3. Start with PM2

```bash
pm2 start ecosystem.config.json
```

### 4. Configure PM2 Startup

```bash
pm2 startup
pm2 save
```

### 5. Monitor Application

```bash
# View logs
pm2 logs genius-loyalty-integration

# Monitor metrics
pm2 monit

# View status
pm2 status
```

### 6. Update Deployment

```bash
# Pull latest code
git pull

# Rebuild
npm install
npm run build

# Reload (zero downtime)
pm2 reload genius-loyalty-integration
```

---

## Cloud Platform Deployment

### AWS Deployment

#### Option 1: EC2 + Docker

1. **Launch EC2 Instance**
   ```bash
   # Use Amazon Linux 2 or Ubuntu
   # t3.medium recommended (2 vCPU, 4GB RAM)
   ```

2. **Install Dependencies**
   ```bash
   sudo yum update -y
   sudo yum install -y docker git
   sudo systemctl start docker
   sudo usermod -a -G docker ec2-user
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd genius-salesforce-loyalty-integration
   cp .env.example .env
   # Edit .env
   docker-compose up -d
   ```

4. **Configure Security Group**
   - Allow inbound: 80, 443, 3000
   - Restrict 3000 to your IP for testing

#### Option 2: ECS (Elastic Container Service)

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name genius-loyalty-integration
   ```

2. **Build and Push Image**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t genius-loyalty-integration .
   docker tag genius-loyalty-integration:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/genius-loyalty-integration:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/genius-loyalty-integration:latest
   ```

3. **Create ECS Cluster and Service**
   - Use AWS Console or CLI
   - Configure task definition with environment variables
   - Set up Application Load Balancer
   - Configure Auto Scaling

#### Option 3: Lambda + API Gateway

For event-driven deployment:

```javascript
// lambda-handler.js
const serverless = require('serverless-http');
const { app } = require('./dist/app');

module.exports.handler = serverless(app);
```

### Google Cloud Platform

#### Deploy to Cloud Run

1. **Build and Push to Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/genius-loyalty-integration
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy genius-loyalty-integration \
     --image gcr.io/PROJECT_ID/genius-loyalty-integration \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "$(cat .env | tr '\n' ',')"
   ```

3. **Set Up Redis**
   ```bash
   gcloud redis instances create integration-redis \
     --size=1 \
     --region=us-central1 \
     --redis-version=redis_6_x
   ```

### Azure

#### Deploy to App Service

1. **Create App Service**
   ```bash
   az webapp up --name genius-loyalty-integration \
     --resource-group loyalty-rg \
     --runtime "NODE|18-lts" \
     --sku B1
   ```

2. **Configure Environment Variables**
   ```bash
   az webapp config appsettings set \
     --resource-group loyalty-rg \
     --name genius-loyalty-integration \
     --settings @.env
   ```

3. **Set Up Redis**
   ```bash
   az redis create \
     --name integration-redis \
     --resource-group loyalty-rg \
     --location eastus \
     --sku Basic \
     --vm-size c0
   ```

---

## Kubernetes Deployment

### 1. Create Kubernetes Manifests

**deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: genius-loyalty-integration
spec:
  replicas: 3
  selector:
    matchLabels:
      app: genius-loyalty-integration
  template:
    metadata:
      labels:
        app: genius-loyalty-integration
    spec:
      containers:
      - name: app
        image: your-registry/genius-loyalty-integration:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_HOST
          value: "redis-service"
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/webhooks/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/webhooks/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: genius-loyalty-service
spec:
  selector:
    app: genius-loyalty-integration
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**redis.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis-service
spec:
  selector:
    app: redis
  ports:
  - protocol: TCP
    port: 6379
    targetPort: 6379
```

### 2. Deploy to Kubernetes

```bash
# Create ConfigMap
kubectl create configmap app-config --from-env-file=.env

# Create Secret
kubectl create secret generic app-secrets \
  --from-literal=SALESFORCE_PASSWORD=xxx \
  --from-literal=SALESFORCE_SECURITY_TOKEN=xxx

# Deploy Redis
kubectl apply -f redis.yaml

# Deploy Application
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl get services
```

### 3. Configure Ingress (HTTPS)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: genius-loyalty-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: genius-loyalty-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: genius-loyalty-service
            port:
              number: 80
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificates location
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Monitoring Setup

### Install Monitoring Tools

```bash
# Install Prometheus Node Exporter
docker run -d \
  --name node-exporter \
  --net="host" \
  --pid="host" \
  prom/node-exporter

# Install Grafana
docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

### Application Metrics

Add to `package.json`:
```json
{
  "dependencies": {
    "prom-client": "^15.1.0"
  }
}
```

---

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] DNS records pointing to server
- [ ] Firewall rules configured
- [ ] Redis connection verified
- [ ] Salesforce connection verified
- [ ] Health check endpoint accessible
- [ ] Webhooks configured in Genius POS
- [ ] Logs rotating properly
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Documentation updated

---

## Rollback Procedure

### Docker
```bash
docker-compose down
docker-compose pull genius-loyalty-integration:previous-version
docker-compose up -d
```

### PM2
```bash
git checkout previous-commit
npm run build
pm2 reload genius-loyalty-integration
```

### Kubernetes
```bash
kubectl rollout undo deployment/genius-loyalty-integration
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs genius-loyalty-integration

# Common issues:
# - Missing environment variables
# - Redis connection failed
# - Port already in use
```

### High Memory Usage
```bash
# Monitor memory
docker stats

# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### Connection Timeouts
- Check security groups/firewall
- Verify DNS resolution
- Check SSL certificate validity

---

## Support

For deployment issues, check:
1. Application logs
2. System logs (`/var/log/syslog`)
3. Container logs
4. Cloud provider logs

Contact your DevOps team or open an issue on GitHub.
