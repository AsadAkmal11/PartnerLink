/**
 * GET /api/health
 * Returns a simple status object confirming the API is reachable.
 */
export function healthCheck(req, res) {
  res.json({
    status: 'ok',
    service: 'PartnerLink API',
    timestamp: new Date().toISOString(),
  });
}

