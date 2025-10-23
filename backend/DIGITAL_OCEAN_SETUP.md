# Digital Ocean Deployment Guide

## Required Environment Variables

Set these in Digital Ocean App Platform:

```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
CORS_ORIGIN=https://your-frontend-domain.com
```

## Health Check Configuration

### HTTP Health Check
- **Path:** `/api/health`
- **Port:** `8080`
- **Success codes:** `200`
- **Initial delay:** `10` seconds
- **Timeout:** `5` seconds
- **Period:** `10` seconds

## Deployment Settings

### Build Command
```
npm install
```

### Run Command
```
npm start
```

This will:
1. Run migrations (`npm run migrate:up`)
2. Start the server (`node src/server.js`)

## Troubleshooting

### Connection Refused Error
- Ensure `NODE_ENV=production` is set (forces binding to 0.0.0.0)
- Check that PORT environment variable matches health check port
- Verify database connection string is correct

### Migration Errors
- Check database connection is accessible from Digital Ocean
- Ensure Supabase database allows connections from Digital Ocean IPs
- Run migrations manually: `npm run migrate:up`

### CORS Errors
- Update `CORS_ORIGIN` to match your frontend domain
- Include `https://` in the origin URL

## Initial Setup Checklist

- [ ] Database created in Supabase
- [ ] Database connection string added to environment variables
- [ ] `NODE_ENV=production` set
- [ ] `PORT=8080` set (or match health check)
- [ ] CORS origin configured
- [ ] Health check endpoint: `/api/health`
- [ ] Health check port: `8080`

## Viewing Logs

Check Digital Ocean logs for:
```
✅ Database connection established successfully
╔═══════════════════════════════════════════════════════╗
║   🚀 Orbital Lending API Server                      ║
║   Binding:     0.0.0.0:8080                          ║
```

If you see `Binding: 0.0.0.0:8080`, the server is correctly configured.

