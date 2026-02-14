import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ✅ CREATE CLIENT ONLY WHEN NEEDED
const getR2Client = () => {
  if (!process.env.CF_ACCESS_KEY || !process.env.CF_SECRET_KEY) {
    throw new Error('R2 credentials missing from env');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CF_ACCESS_KEY,
      secretAccessKey: process.env.CF_SECRET_KEY
    }
  });
};

/* -------- PROFILE PHOTO -------- */
router.post('/profile-photo', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const { userId } = req.body;

    if (!file || !userId) {
      return res.status(400).json({ error: 'File or userId missing' });
    }

    const r2 = getR2Client(); // ✅ env-safe
    const key = `profiles/${userId}.jpg`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CF_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    res.json({
      url: `${process.env.CF_PUBLIC_URL}/${key}`
    });
  } catch (err) {
    console.error('PROFILE PHOTO UPLOAD ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

/* -------- POST MEDIA -------- */
router.post('/post-media', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const { userId } = req.body;

    const r2 = getR2Client();
    const key = `posts/${userId}/${Date.now()}-${file.originalname}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CF_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    res.json({
      url: `${process.env.CF_PUBLIC_URL}/${key}`
    });
  } catch (err) {
    console.error('POST MEDIA UPLOAD ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
