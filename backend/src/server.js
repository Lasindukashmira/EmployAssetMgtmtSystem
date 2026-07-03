/**
 * src/server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Entry point — binds the Express app to the configured port.
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Employee & Asset API server running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health`);
  console.log(`   Mode:    In-Memory Store (Azure SQL not yet connected)\n`);
});
