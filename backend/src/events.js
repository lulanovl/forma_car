/**
 * Per-carwash Server-Sent Events broadcaster.
 * Admin clients connect to /api/events and receive push notifications for THEIR
 * carwash only — events never leak across tenants.
 */

// Map<carwashId, Set<res>>
const clientsByCarwash = new Map();

/**
 * Subscribe an SSE response to a carwash's broadcast channel.
 * Returns an unsubscribe function — call it on request close.
 */
function subscribe(carwashId, res) {
  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no', // disable nginx buffering if behind proxy
  });
  // Initial ping so browser confirms connection
  res.write('event: connected\ndata: ok\n\n');

  let set = clientsByCarwash.get(carwashId);
  if (!set) {
    set = new Set();
    clientsByCarwash.set(carwashId, set);
  }
  set.add(res);

  return () => {
    set.delete(res);
    if (set.size === 0) clientsByCarwash.delete(carwashId);
  };
}

/**
 * Broadcast an SSE event to the admin clients of ONE carwash.
 * @param {number} carwashId
 * @param {string} event  - event name
 * @param {object} data   - JSON-serialisable payload
 */
function broadcast(carwashId, event, data) {
  const set = clientsByCarwash.get(carwashId);
  if (!set || set.size === 0) return;
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(msg);
    } catch {
      set.delete(res);
    }
  }
}

module.exports = { subscribe, broadcast };
