import app from './app.js';
import { config } from './config/env.js';

app.listen(config.port, () => {
  console.log(`[PartnerLink API] Server running on http://localhost:${config.port}`);
  console.log(`[PartnerLink API] Environment: ${config.nodeEnv}`);
  console.log(`[PartnerLink API] Health check: http://localhost:${config.port}/api/health`);
});

