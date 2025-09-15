# Homelab Dashboard

A professional dashboard for monitoring your homelab infrastructure with Uptime Kuma integration.

## Features

- 🖥️ **Real-time Service Monitoring** - Displays actual uptime data from Uptime Kuma
- 📊 **Live Metrics** - Service count, uptime percentages, response times
- 🔄 **Auto-refresh** - Updates every 30 seconds automatically
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔒 **Secure API Integration** - API keys stored securely in environment variables

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Your API key is already configured in the `.env` file:

```env
UPTIME_KUMA_API_KEY=uk2_FJCEv-ZoeDWdmIyW1uTolgQG1Nm5L9I7QaOIJ7OV
UPTIME_KUMA_URL=http://mac-ubuntu:3001
REFRESH_INTERVAL=30000
```

### 3. Start the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The dashboard will be available at: `http://localhost:3000`

## Uptime Kuma API Configuration

### Enable API Access in Uptime Kuma

1. Open your Uptime Kuma interface at `http://mac-ubuntu:3001`
2. Go to **Settings** → **API Keys**
3. Your API key `uk2_FJCEv-ZoeDWdmIyW1uTolgQG1Nm5L9I7QaOIJ7OV` should already be configured

### API Authentication

The dashboard uses HTTP Basic Authentication with your API key:

```bash
curl -u":uk2_FJCEv-ZoeDWdmIyW1uTolgQG1Nm5L9I7QaOIJ7OV" http://mac-ubuntu:3001/metrics
```

Note: The `:` before the key is required for basic auth (username field is empty).

## File Structure

```
homelab-dashboard/
├── index.html          # Main dashboard interface
├── style.css           # Professional homelab styling
├── server.js           # Node.js backend for API proxy
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (API keys)
└── README.md           # This file
```

## Customization

### Adding More Services

Edit the `SERVICE_CONFIG` object in `index.html`:

```javascript
const SERVICE_CONFIG = {
    'Your Service Name': {
        icon: 'https://example.com/icon.png',
        description: 'Service description',
        url: 'http://your-service-url'
    }
};
```

### Changing Refresh Interval

Update the `REFRESH_INTERVAL` in `.env` (milliseconds):

```env
REFRESH_INTERVAL=30000  # 30 seconds
```

## Troubleshooting

### API Connection Issues

1. **Check API Key**: Ensure the key in `.env` matches your Uptime Kuma API key
2. **Check URL**: Verify `UPTIME_KUMA_URL` points to your Uptime Kuma instance
3. **Check Logs**: Run `npm run dev` to see detailed console output
4. **Test API**: Try the curl command above to test API access directly

### Dashboard Shows "Loading..."

- Check browser console for error messages
- Verify the Node.js server is running
- Ensure Uptime Kuma is accessible from the server

### No Services Displayed

- Check that your Uptime Kuma has monitors configured
- Verify the service names in `SERVICE_CONFIG` match your monitor names
- Check the browser network tab for API call failures

## Security Notes

- The `.env` file contains sensitive API keys - never commit it to public repositories
- The API key provides read access to your monitoring data
- Consider running this dashboard behind a reverse proxy with authentication for external access

## License

MIT License - feel free to modify and use for your homelab!