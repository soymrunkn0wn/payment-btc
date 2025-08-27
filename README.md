# Bitcoin Payment Landing Page

A basic landing page that integrates with the Zaprite API to accept Bitcoin, Lightning Network, and card payments.

## Features

- **Multiple Payment Methods**: Bitcoin on-chain, Lightning Network, and credit cards
- **Zaprite Integration**: Uses Zaprite's API for secure payment processing
- **Real-time Status Updates**: Automatic polling for payment status updates
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Saves API key and order status locally
- **No Backend Required**: Pure client-side JavaScript implementation

## Prerequisites

1. **Zaprite Account**: Sign up at [https://app.zaprite.com](https://app.zaprite.com)
2. **API Key**: Get your API key from Zaprite API settings
3. **Payment Methods**: Configure your payment methods in Zaprite (Bitcoin wallet, Lightning node, Stripe for cards)

## Setup Instructions

### 1. Get Your Zaprite API Key

1. Sign up for a Zaprite account at [https://app.zaprite.com](https://app.zaprite.com)
2. Navigate to **Settings > API**
3. Generate a new API key
4. Copy the API key for use in the application

### 2. Configure Payment Methods in Zaprite

Before using the payment page, ensure you have configured your payment methods in your Zaprite account:

- **Bitcoin On-chain**: Connect your Bitcoin wallet (xpub/zpub)
- **Lightning Network**: Connect your Lightning node or custodial Lightning account
- **Credit Cards**: Connect Stripe or another supported payment processor

### 3. Run the Application

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Click the "⚙️ API Config" button in the footer
4. Enter your Zaprite API key and click "Save"
5. Test the payment flow by clicking "Pay Now"

## File Structure

```
payment-bitcoin/
├── index.html          # Main landing page
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## Usage

### Basic Payment Flow

1. **Configure API**: Enter your Zaprite API key in the configuration panel
2. **Initiate Payment**: Click the "Pay Now" button
3. **Order Creation**: The app creates an order via Zaprite API
4. **Payment Processing**: Opens Zaprite checkout in a new window
5. **Status Tracking**: Automatically polls for payment status updates
6. **Completion**: Shows success/failure status

### API Configuration

- Click the "⚙️ API Config" button to show/hide the configuration panel
- Enter your Zaprite API key
- The key is stored locally in your browser (localStorage)
- The key is never sent to any server except Zaprite's API

### Keyboard Shortcuts (Development)

- `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac): Clear current order from localStorage
- `Ctrl+Shift+K` (or `Cmd+Shift+K` on Mac): Toggle API configuration panel

## API Integration

The application uses the following Zaprite API endpoints:

### Create Order
```
POST https://api.zaprite.com/v1/orders
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
    "name": "Product Name",
    "description": "Product Description",
    "amount": 29.99,
    "currency": "USD"
}
```

### Get Order Status
```
GET https://api.zaprite.com/v1/orders/{order_id}
Authorization: Bearer YOUR_API_KEY
```

## Customization

### Product Configuration

Edit the `PRODUCT` object in `script.js`:

```javascript
const PRODUCT = {
    name: 'Your Product Name',
    description: 'Your product description',
    price: 99.99,
    currency: 'USD'
};
```

### Styling

- Modify `styles.css` to change colors, fonts, and layout
- The design uses CSS Grid and Flexbox for responsive layout
- Color scheme is based on Bitcoin orange (#f7931a)

### Webhooks (Optional)

To receive server-side notifications about payment status:

1. Set up a webhook endpoint on your server
2. Add `webhook_url` to the order creation payload in `script.js`
3. Handle webhook notifications in your backend

```javascript
const orderData = {
    name: PRODUCT.name,
    description: PRODUCT.description,
    amount: PRODUCT.price,
    currency: PRODUCT.currency,
    webhook_url: 'https://your-domain.com/webhook'
};
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Considerations

1. **API Key Storage**: API keys are stored in localStorage (client-side only)
2. **HTTPS Required**: Use HTTPS in production to protect API communications
3. **Webhook Security**: If using webhooks, verify webhook signatures
4. **No Sensitive Data**: No sensitive payment data is processed client-side

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Verify your API key is correct
   - Check that your Zaprite account is active
   - Ensure you're using the correct API key format

2. **"No checkout URL received" error**
   - Verify your Zaprite account has payment methods configured
   - Check that your API key has the correct permissions
   - Ensure your account is not in a restricted state

3. **Payment window doesn't open**
   - Check if popup blocker is enabled
   - Try clicking the payment link manually
   - Verify the checkout URL is valid

4. **Status not updating**
   - Check browser console for JavaScript errors
   - Verify network connectivity
   - Try refreshing the page

### Debug Functions

Open browser console and use these debug functions:

```javascript
// Clear saved order
zapriteDebug.clearOrder()

// Check current API key
zapriteDebug.API_KEY()

// Manually get order status
zapriteDebug.getOrderStatus('order_id')
```

## Development

### Local Development

1. Serve files via HTTP (not file://) for proper API calls:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

2. Open `http://localhost:8000` in your browser

### Testing

- Use Zaprite's test mode (if available) for development
- Test with small amounts first
- Verify all payment methods work correctly

## Support

- **Zaprite Documentation**: [https://api.zaprite.com](https://api.zaprite.com)
- **Zaprite Support**: [https://help.zaprite.com](https://help.zaprite.com)
- **Bitcoin/Lightning Resources**: [https://bitcoin.org](https://bitcoin.org)

## License

This project is provided as-is for educational and demonstration purposes. Modify and use according to your needs.

## Disclaimer

This is a demonstration application. For production use:
- Implement proper error handling
- Add comprehensive logging
- Set up monitoring and alerts
- Follow security best practices
- Test thoroughly with real payments
