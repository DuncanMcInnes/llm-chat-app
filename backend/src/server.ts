import express from 'express';
import cors from 'cors';
import { config } from './config';
import { LLMFactory } from './services/llm/LLMFactory';
import chatRoutes from './routes/chat';

const app = express();

// Initialize LLM providers
LLMFactory.initialize();
const availableProviders = LLMFactory.getAvailableProviders();
console.log(`🤖 Initialized LLM providers: ${availableProviders.length > 0 ? availableProviders.join(', ') : 'none (check API keys)'}`);

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', chatRoutes);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 CORS enabled for: ${config.corsOrigin}`);
});


