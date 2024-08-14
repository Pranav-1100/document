require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { initDatabase } = require('./config/db');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const { User } = require('./models');
const { sequelize } = require('./config/db');

const app = express();
const port = process.env.PORT || 234;

app.use(cors());

// Initialize database
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

// Middleware
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Apply authMiddleware to all routes except /api/auth
app.use('/api', authMiddleware);

async function syncDatabase() {
  try {
    await User.sync({ alter: true });
    console.log('User model synced successfully');
  } catch (error) {
    console.error('Error syncing User model:', error);
  }
}

// Call this function before starting your server
syncDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
