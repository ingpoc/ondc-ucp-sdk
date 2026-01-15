import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
// Direct SDK imports - no MCP (POC website, not part of SDK)
import { SellerClient } from '@ondc-agent/seller-sdk';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'api-server' });
});

// Initialize seller client (will be configured properly later)
let sellerClient: SellerClient | null = null;

app.post('/api/seller/init', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    sellerClient = new SellerClient(config);
    console.log('Seller client initialized');
    res.json({ success: true, message: 'Seller client initialized' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export { app };
