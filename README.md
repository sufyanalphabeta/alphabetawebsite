# ALPHABETA Corporate Portal

## Windows Quick Start

### 1. Start PostgreSQL
```
docker compose -f docker-compose.dev.yml up -d db
```

### 2. Start CMS
```
cd apps\cms
copy .env.example .env
pnpm install
pnpm dev
```
Copy STRAPI_API_TOKEN from the terminal output.

### 3. Start Frontend
```
cd apps\web
copy .env.example .env
# Edit .env — paste the STRAPI_API_TOKEN
pnpm install
pnpm dev
```

Open: http://localhost:3000 (Arabic) | http://localhost:3000/en (English)
CMS Admin: http://localhost:1337/admin
