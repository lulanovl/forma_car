const db = require('./db/knex');

const TELEGRAM_TIMEOUT_MS = 5000;

/**
 * Build the notification text for a new order.
 * extras: array of additional_services rows for this order (may be empty).
 */
function formatOrderMessage(carwash, order, extras) {
  const extrasText = extras.length ? extras.map(e => `• ${e.name}`).join('\n') : 'Нет';
  const total = Number(order.price_snapshot || 0) + Number(order.extras_price || 0);
  const plate = order.plate_number ? ` (${order.plate_number})` : '';

  return [
    `🏪 ${carwash.name} — новая запись ${order.order_number}`,
    '',
    `👤 ${order.client_name}`,
    `📞 ${order.client_phone}`,
    `🚘 ${order.client_car}${plate}`,
    `🧽 ${order.service_name}`,
    `📅 ${order.date}  ⏰ ${order.time_slot}`,
    '',
    `➕ Доп. услуги:\n${extrasText}`,
    order.note ? `💬 ${order.note}` : null,
    '',
    `💰 Итого: ${total} сом`,
  ].filter(line => line !== null).join('\n');
}

/**
 * Send a Telegram notification for a new order to the order's carwash.
 * No-ops silently if that carwash hasn't configured a bot token + chat id.
 * Per-carwash credentials come from the carwashes table (multi-tenant), not env.
 */
async function sendOrderNotification(carwashId, order) {
  const carwash = await db('carwashes').where({ id: carwashId }).first();
  if (!carwash || !carwash.telegram_bot_token || !carwash.telegram_chat_id) {
    return; // Telegram not configured for this carwash
  }

  let extras = [];
  try {
    const ids = JSON.parse(order.additional_service_ids || '[]');
    if (Array.isArray(ids) && ids.length) {
      extras = await db('additional_services').where({ carwash_id: carwashId }).whereIn('id', ids);
    }
  } catch {
    // malformed additional_service_ids — just send without extras
  }

  const text = formatOrderMessage(carwash, order, extras);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.telegram.org/bot${carwash.telegram_bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: carwash.telegram_chat_id, text }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Telegram API ${res.status}: ${detail.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fire-and-forget wrapper: never rejects into the request flow. Call after the
 * HTTP response is sent so a slow/broken Telegram never delays the client.
 */
function notifyNewOrder(carwashId, order) {
  sendOrderNotification(carwashId, order).catch((err) => {
    console.error('Telegram notify failed:', err.message);
  });
}

module.exports = { notifyNewOrder };
