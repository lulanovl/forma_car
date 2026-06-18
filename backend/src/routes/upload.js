const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/uploadController');

// In-memory (no disk) — the buffer is streamed straight to Vercel Blob.
// 4 MB cap stays under Vercel's serverless request body limit (~4.5 MB).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Можно загружать только изображения'));
  },
});

// Wrap multer so its errors (too large / wrong type) return a clear 400 instead
// of falling through to the generic 500 handler (which hides messages in prod).
function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Файл слишком большой (макс. 4 МБ)' : err.message;
      return res.status(400).json({ error: msg });
    }
    next();
  });
}

router.post('/', auth, handleUpload, ctrl.upload);

module.exports = router;
