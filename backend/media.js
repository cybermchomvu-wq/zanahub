import express from 'express';
import multer from 'multer';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const router = express.Router();

const upload = multer({
  dest: tmpdir(),
  limits: {
    fileSize: 200 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!file.originalname.toLowerCase().endsWith('.webm')) {
      return callback(new Error('Please upload a .webm video.'));
    }
    callback(null, true);
  },
});

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let errorText = '';

    process.stderr.on('data', chunk => {
      errorText = (errorText + chunk.toString()).slice(-5000);
    });

    process.on('error', reject);

    process.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(errorText || `FFmpeg exited with code ${code}`));
    });
  });
}

router.post('/convert', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Choose a WebM video first.' });
  }

  let workDir;

  try {
    workDir = await mkdtemp(path.join(tmpdir(), 'zanahub-video-'));

    const inputPath = req.file.path;
    const outputPath = path.join(workDir, 'converted.mp4');

    // First attempt: Intel VAAPI hardware encoding.
    try {
      await runFFmpeg([
        '-hide_banner', '-loglevel', 'error', '-y',
        '-init_hw_device', 'vaapi=va:,driver=iHD',
        '-filter_hw_device', 'va',
        '-i', inputPath,
        '-vf', 'format=nv12,hwupload',
        '-c:v', 'h264_vaapi',
        '-qp', '23',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        outputPath,
      ]);
    } catch {
      // If hardware encoding is unavailable for this video, use CPU encoding.
      await rm(outputPath, { force: true });

      await runFFmpeg([
        '-hide_banner', '-loglevel', 'error', '-y',
        '-i', inputPath,
        '-c:v', 'libx264', '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        outputPath,
      ]);
    }

    await access(outputPath);

    const safeBaseName = path.basename(req.file.originalname, path.extname(req.file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 100) || 'converted-video';

    res.download(outputPath, `${safeBaseName}.mp4`, async () => {
      await rm(req.file.path, { force: true }).catch(() => {});
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    });
  } catch (error) {
    console.error('Video conversion failed:', error.message);

    await rm(req.file.path, { force: true }).catch(() => {});
    if (workDir) {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Video conversion failed. Try another WebM file.',
      });
    }
  }
});

export function registerMediaRoutes(app) {
  app.use('/api/video', router);

  // Convert upload-related errors into readable responses.
  app.use((error, _req, res, next) => {
    if (error instanceof multer.MulterError) {
      return res.status(413).json({
        error: error.code === 'LIMIT_FILE_SIZE'
          ? 'The video exceeds the 200 MB upload limit.'
          : 'The upload could not be accepted.',
      });
    }

    if (error.message === 'Please upload a .webm video.') {
      return res.status(400).json({ error: error.message });
    }

    next(error);
  });
}
