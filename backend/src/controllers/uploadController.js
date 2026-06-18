const { put } = require('@vercel/blob');

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];

// POST /api/upload (admin) — multipart field `file`. Stores the image in Vercel
// Blob (public) and returns { url }. The caller then saves that url onto a
// service (image_url) or the carwash (hero_image_url).
exports.upload = async (req, res, next) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({
        error: 'Хранилище изображений не настроено. Создайте Blob store в Vercel и подключите его к проекту (переменная BLOB_READ_WRITE_TOKEN).',
      });
    }
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });

    const rawExt = (req.file.originalname.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const ext = ALLOWED_EXT.includes(rawExt) ? rawExt : 'jpg';
    const kind = /^[a-z0-9_-]+$/i.test(req.body.kind || '') ? req.body.kind : 'img';

    // Namespaced by tenant; unique name avoids cache/collision issues.
    const pathname = `carwash-${req.carwashId || 'x'}/${kind}-${Date.now()}.${ext}`;

    const blob = await put(pathname, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.json({ url: blob.url });
  } catch (err) {
    next(err);
  }
};
