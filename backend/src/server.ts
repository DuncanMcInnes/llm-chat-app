import express from 'express';
import cors from 'cors';
import { config } from './config';
import { LLMFactory } from './services/llm/LLMFactory';
import { storageConfig } from './config/storage';
import { KnowledgeBaseService } from './services/knowledgeBaseService';
import chatRoutes from './routes/chat';
import documentRoutes from './routes/documents';
import knowledgeBaseRoutes from './routes/knowledge-bases';

const app = express();

// Initialize storage
storageConfig.initialize();
console.log('📁 Storage initialized');

// Initialize Knowledge Base service
KnowledgeBaseService.initialize();
console.log('📚 Knowledge Base service initialized');

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
app.use('/api/documents', documentRoutes);
app.use('/api/knowledge-bases', knowledgeBaseRoutes);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 CORS enabled for: ${config.corsOrigin}`);
});


