/**
 * =============================================================================
 * FILE: middleware/upload.js
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This is a reusable file upload middleware for Express.js.
 * It supports images, videos, PDFs, Excel, Word, text, and other documents.
 *
 * THE MOST IMPORTANT FEATURE:
 * ----------------------------
 * Files are held in MEMORY first. They are only saved to disk AFTER your
 * database query succeeds. If your DB query fails, no file is saved. Clean.
 *
 * HOW TO USE IT (quick example):
 * --------------------------------
 *
 *   const upload = require('../middleware/upload');
 *
 *   // Single file:
 *   router.post('/create-user',
 *     upload({ folder: 'users' }).single('profilePic'),
 *     userController.createUser
 *   );
 *
 *   // Multiple different fields at once:
 *   router.post('/create-user',
 *     upload({ folder: 'users' }).fields([
 *       { name: 'profilePic', maxCount: 1 },
 *       { name: 'coverImage', maxCount: 1 },
 *       { name: 'userDocs',   maxCount: 5 },
 *     ]),
 *     userController.createUser
 *   );
 *
 *   // Then in your controller, save files to disk AFTER DB success:
 *   const { saveFiles } = require('../middleware/upload');
 *
 *   exports.createUser = async (req, res) => {
 *     const [result] = await pool.query('INSERT INTO users ...', [...]);
 *     // DB succeeded → now save files
 *     const saved = await saveFiles(req, 'users');
 *     // saved.profilePic  → 'users/filename.jpg'
 *     // saved.coverImage  → 'users/filename.jpg'
 *   };
 *
 * =============================================================================
 */

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');

// =============================================================================
// STEP 1 — ALLOWED FILE TYPES
// =============================================================================
// Add or remove MIME types here if you need to support more/fewer file types.

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',

  // Videos (max size handled separately below)
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',  // .avi
  'video/webm',
  'video/x-matroska', // .mkv

  // PDFs
  'application/pdf',

  // Microsoft Office
  'application/msword',                                                      // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',                                                // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
  'application/vnd.ms-powerpoint',                                           // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx

  // Text & Data
  'text/plain',   // .txt
  'text/csv',     // .csv
  'application/json',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
];

// =============================================================================
// STEP 2 — SIZE LIMITS
// =============================================================================

const SIZE_LIMITS = {
  video   : 50  * 1024 * 1024, // 50 MB  for videos
  default : 10  * 1024 * 1024, // 10 MB  for everything else
};

// =============================================================================
// STEP 3 — MULTER MEMORY STORAGE
// =============================================================================
// We store files in memory (RAM) — NOT on disk yet.
// This way, if your DB query fails later, nothing is written to disk.

const memoryStorage = multer.memoryStorage();

// =============================================================================
// STEP 4 — FILE FILTER
// =============================================================================
// This function runs for every file. It checks if the file type is allowed.

function fileFilter(req, file, cb) {
  // console.log('FILE:', {
  //   originalname: file.originalname,
  //   mimetype: file.mimetype,
  //   fieldname: file.fieldname,
  // });

  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true); //  allow this file
  } else {
    //  reject this file with a clear error message
    cb(
      new Error(
        `File type "${file.mimetype}" is not allowed. ` +
        `Allowed types: images, videos, PDF, Word, Excel, text files.`
      ),
      false
    );
  }
}

// =============================================================================
// STEP 5 — CREATE THE UPLOAD MIDDLEWARE
// =============================================================================
// This is the main function you import and call in your routes.
//
// Options:
//   folder  (string)  - subfolder inside /uploads/  e.g. 'users', 'gallery'
//   maxSize (number)  - optional custom max size in bytes
//
// Usage:
//   upload({ folder: 'users' }).single('profilePic')
//   upload({ folder: 'gallery' }).array('photos', 10)
//   upload({ folder: 'users' }).fields([...])

function upload({ folder = 'general', maxSize } = {}) {

  const multerInstance = multer({
    storage   : memoryStorage,
    fileFilter: fileFilter,

    limits: {
      // We set a high limit here (50MB) to allow videos.
      // Per-file type size checks happen in saveFiles() below.
      fileSize: maxSize || SIZE_LIMITS.video,
    },
  });

  // Attach the target folder to the request so saveFiles() can read it later.
  // We return a wrapper that first sets req._uploadFolder, then runs multer.
  return {
    single: (fieldName) => [
      setFolder(folder),
      multerInstance.single(fieldName),
    ],

    array: (fieldName, maxCount) => [
      setFolder(folder),
      multerInstance.array(fieldName, maxCount),
    ],

    fields: (fieldsArray) => [
      setFolder(folder),
      multerInstance.fields(fieldsArray),
    ],

    none: () => [
      setFolder(folder),
      multerInstance.none(),
    ],
  };
}

// Small helper middleware that just saves the folder name on the request.
function setFolder(folder) {
  return (req, res, next) => {
    req._uploadFolder = folder;
    next();
  };
}

// =============================================================================
// STEP 6 — saveFiles() — CALL THIS IN YOUR CONTROLLER AFTER DB SUCCESS
// =============================================================================
// This function takes the files that multer held in memory and writes them
// to disk. Call it ONLY after your database query has succeeded.
//
// Returns an object where each key is the field name and value is the
// relative file path  e.g. { profilePic: 'users/1234567890-abc.jpg' }
//
// Usage in controller:
//   const saved = await saveFiles(req, 'users');
//   const profilePicPath = saved.profilePic; // store this in DB

async function saveFiles(req, folder) {
  // Use folder passed directly, or fall back to what the middleware set.
  const targetFolder = folder || req._uploadFolder || 'general';

  // Full path on disk, e.g.  /your-project/uploads/users/
  const uploadDir = path.join(process.cwd(), 'uploads', targetFolder);

  // Create the folder if it doesn't exist yet (recursive = create nested too)
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const saved = {}; // this is what we return to the controller

  // ── Case A: .single() was used  →  req.file is a single file object ────────
  if (req.file) {
    const filePath = await writeFileToDisk(req.file, uploadDir, targetFolder);
    // Key = original field name e.g. 'profilePic'
    saved[req.file.fieldname] = filePath;
  }

  // ── Case B: .array() was used  →  req.files is an array ────────────────────
  else if (Array.isArray(req.files)) {
    for (const file of req.files) {
      const filePath = await writeFileToDisk(file, uploadDir, targetFolder);
      // Group files with the same field name into an array
      if (!saved[file.fieldname]) saved[file.fieldname] = [];
      saved[file.fieldname].push(filePath);
    }
  }

  // ── Case C: .fields() was used  →  req.files is an object of arrays ────────
  else if (req.files && typeof req.files === 'object') {
    for (const fieldName of Object.keys(req.files)) {
      const filesForField = req.files[fieldName];
      saved[fieldName] = [];

      for (const file of filesForField) {
        const filePath = await writeFileToDisk(file, uploadDir, targetFolder);
        saved[fieldName].push(filePath);
      }

      // If only one file for this field, unwrap from array for convenience
      // e.g. saved.profilePic = 'users/abc.jpg'  instead of  ['users/abc.jpg']
      if (saved[fieldName].length === 1) {
        saved[fieldName] = saved[fieldName][0];
      }
    }
  }

  return saved;
}

// =============================================================================
// STEP 7 — writeFileToDisk() — INTERNAL HELPER
// =============================================================================
// Generates a unique filename and writes the file buffer to disk.
// Returns the relative path e.g. 'users/1717000000000-a3f2b1.jpg'

async function writeFileToDisk(file, uploadDir, targetFolder) {

  // ── Per-file size check (especially for non-video files) ──
  const isVideo = file.mimetype.startsWith('video/');
  const limit   = isVideo ? SIZE_LIMITS.video : SIZE_LIMITS.default;

  if (file.size > limit) {
    const limitMB = Math.round(limit / 1024 / 1024);
    throw new Error(
      `File "${file.originalname}" is too large. ` +
      `Maximum size for ${isVideo ? 'videos' : 'this file type'} is ${limitMB}MB.`
    );
  }

  // ── Generate a unique filename ──
  // Format: timestamp-randomhex.extension
  // e.g.  1717000000000-a3f2b1c9.jpg
  const ext        = path.extname(file.originalname).toLowerCase();
  const randomHex  = crypto.randomBytes(4).toString('hex'); // 8 random chars
  const filename   = `${Date.now()}-${randomHex}${ext}`;
  const fullPath   = path.join(uploadDir, filename);

  // ── Write buffer to disk ──
  await fs.promises.writeFile(fullPath, file.buffer);

  // Return relative path (this is what you store in the database)
  // e.g. 'users/1717000000000-a3f2b1c9.jpg'
  return `${targetFolder}/${filename}`;
}

// =============================================================================
// STEP 8 — ERROR HANDLER FOR MULTER ERRORS
// =============================================================================
// Add this to your Express app AFTER your routes to catch upload errors.
//
// In app.js:
//   const { uploadErrorHandler } = require('./middleware/upload');
//   app.use(uploadErrorHandler);

function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (file too large, too many files, etc.)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 50MB for videos, 10MB for other files.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded at once.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err && err.message && err.message.includes('not allowed')) {
    // Our custom file type error from fileFilter()
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Not an upload error — pass to next error handler
  next(err);
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = { upload, saveFiles, uploadErrorHandler };