# Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel
```

### 4. Set Environment Variables
After deployment, go to your Vercel dashboard and add these environment variables:

#### Required Variables:
- `INCH_API_KEY`: Your 1inch API key
- `PRIVATE_KEY`: Your Ethereum private key
- `CHAINLINK_ORACLE_ADDRESS`: Your Chainlink oracle address

#### Optional Variables:
- `INFURA_KEY`: Your Infura API key
- `ALCHEMY_KEY`: Your Alchemy API key
- `NODE_ENV`: Set to "production"
- `CORS_ORIGIN`: Your Vercel domain (e.g., https://your-app.vercel.app)

### 5. Redeploy with Environment Variables
```bash
vercel --prod
```

## 🔧 Configuration Files

### vercel.json
- Configures builds for frontend and backend
- Sets up API routing
- Defines function timeout

### api/index.ts
- Vercel serverless function handler
- Exports Express app for API requests

### Frontend API Configuration
- Uses relative `/api` path in production
- Falls back to localhost in development

## 🧪 Testing Deployment

### Local Testing
```bash
vercel dev
```

### Production Testing
1. Deploy to Vercel
2. Test API endpoints: `https://your-app.vercel.app/api/health`
3. Test frontend: `https://your-app.vercel.app`

## 📝 Troubleshooting

### Common Issues:
1. **API not working**: Check environment variables in Vercel dashboard
2. **Build fails**: Ensure all dependencies are in package.json
3. **CORS errors**: Update CORS_ORIGIN to your Vercel domain

### Debug Commands:
```bash
# View deployment logs
vercel logs

# Check deployment status
vercel ls

# Remove deployment
vercel remove
```

## 🔒 Security Notes

- Never commit `.env` files
- Use Vercel environment variables for secrets
- Keep private keys secure
- Enable CORS for your domain only 