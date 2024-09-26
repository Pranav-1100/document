require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { initDatabase } = require('./config/db');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/document');
const { User, Document } = require('./models');
const { sequelize } = require('./config/db');
const documentTypeRoutes = require('./routes/documentTypes');
const tagRoutes = require('./routes/tags');
const conversationRoutes = require('./routes/conversations');
const DocumentEmbeddingService = require('./services/documentEmbeddingService');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Initialize database
async function initialize() {
  try {
    await initDatabase();
    console.log('Database initialized successfully');
    await DocumentEmbeddingService.initialize();
    console.log('Document Embedding Service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
}

// Middleware
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', authMiddleware);
app.use('/api/documents', documentRoutes);
app.use('/api/document-types', documentTypeRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/conversations', conversationRoutes);

// async function syncDatabase() {
//   try {
//     await User.sync({ alter: true });
//     await Document.sync({ alter: true });
//     console.log('Models synced successfully');
//   } catch (error) {
//     console.error('Error syncing models:', error);
//   }
// }

// Call this function before starting your server
// syncDatabase().then(() => {
//   app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
//   });
// });


initialize().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});