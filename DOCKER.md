# 🐳 Docker Kurulum ve Kullanım

## Gereksinimler
- Docker Engine
- Docker Compose

## 🚀 Hızlı Başlangıç

1. Environment dosyasını oluşturun:
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve gerekli değişkenleri ayarlayın
```

2. Development ortamını başlatın:
```bash
docker-compose up
```

3. Production ortamını başlatın:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔧 Environment Variables

| Değişken | Açıklama | Örnek |
|----------|-----------|--------|
| INCH_API_KEY | 1inch API anahtarı | abc123... |
| INFURA_KEY | Infura API anahtarı | xyz789... |
| CHAINLINK_ORACLE_ADDRESS | Oracle kontrat adresi | 0x123... |
| PRIVATE_KEY | Resolver bot private key | 0xabc... |

## 📝 Servisler

### Backend API (port: 3000)
- REST API endpoints
- Swagger UI: http://localhost:3000/api-docs

### Resolver Bot
- RFQ monitoring
- Predicate kontrolleri
- Order filling

### Frontend (port: 5173 dev, 80 prod)
- React UI
- Tailwind styling

## 🔍 Logging

Loglar `./logs` klasöründe tutulur:
- `./logs/backend/` -> Backend logları
- `./logs/resolver/` -> Resolver bot logları

## 🩺 Health Checks

Her servis için health check endpoints:
- Backend: http://localhost:3000/health
- Resolver: Internal health check
- Frontend: Nginx status page

## ⚠️ Troubleshooting

1. Port çakışması:
```bash
# Mevcut portları kontrol edin
docker-compose ps
# Farklı port kullanın
ports:
  - "3001:3000"
```

2. Container yeniden başlatma:
```bash
docker-compose restart [service_name]
```

3. Log inceleme:
```bash
docker-compose logs -f [service_name]
```

4. Volume temizleme:
```bash
docker-compose down -v
```

## 🔐 Production Best Practices

1. Secrets yönetimi:
   - Docker secrets veya Vault kullanın
   - .env dosyasını asla commit etmeyin

2. Resource limits:
   - CPU ve memory limitleri ayarlayın
   - Monitoring tools ekleyin

3. Backup:
   - Volume backup stratejisi oluşturun
   - Log retention policy belirleyin
