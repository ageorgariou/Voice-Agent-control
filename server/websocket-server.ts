import WebSocket from 'ws';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set<WebSocket>();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const webhookData = req.body;
  console.log('Received webhook data:', webhookData);

  // Broadcast the data to all connected WebSocket clients
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(webhookData));
    }
  });

  res.status(200).json({ message: 'Data received and broadcast' });
});

// Start the HTTP server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Webhook server running at http://localhost:${PORT}/webhook`);
}); 