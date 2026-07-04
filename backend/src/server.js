/**
 * src/server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Entry point — binds the Express app to the configured port.
 */

const result = require('dotenv').config();


const app = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Employee & Asset API server running`);
});
