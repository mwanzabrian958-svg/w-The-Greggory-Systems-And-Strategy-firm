const MAX_PORTFOLIO_MEDIA_FILES = 10;
const MAX_PORTFOLIO_MEDIA_FILE_SIZE = 8 * 1024 * 1024;
const MAX_PORTFOLIO_MEDIA_TOTAL_SIZE = 25 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

function mediaTypeForMime(mimeType) {
  if (IMAGE_MIME_TYPES.has(mimeType)) return 'image';
  if (VIDEO_MIME_TYPES.has(mimeType)) return 'video';
  return null;
}

function mediaTypeForFile(file) {
  const mediaType = mediaTypeForMime(file.mimetype);
  const data = file.buffer;
  if (!mediaType || !Buffer.isBuffer(data)) return null;

  const startsWith = (signature) =>
    data.length >= signature.length && data.subarray(0, signature.length).equals(signature);

  switch (file.mimetype) {
    case 'image/avif':
      return data.toString('ascii', 4, 8) === 'ftyp' &&
        ['avif', 'avis'].includes(data.toString('ascii', 8, 12)) ? mediaType : null;
    case 'image/gif':
      return ['GIF87a', 'GIF89a'].includes(data.toString('ascii', 0, 6)) ? mediaType : null;
    case 'image/jpeg':
      return startsWith(Buffer.from([0xff, 0xd8, 0xff])) ? mediaType : null;
    case 'image/png':
      return startsWith(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ? mediaType : null;
    case 'image/webp':
      return data.toString('ascii', 0, 4) === 'RIFF' &&
        data.toString('ascii', 8, 12) === 'WEBP' ? mediaType : null;
    case 'video/mp4':
      return data.toString('ascii', 4, 8) === 'ftyp' &&
        ['isom', 'iso2', 'mp41', 'mp42', 'avc1', 'M4V '].includes(data.toString('ascii', 8, 12))
        ? mediaType
        : null;
    case 'video/quicktime':
      return data.toString('ascii', 4, 8) === 'ftyp' &&
        data.toString('ascii', 8, 12) === 'qt  ' ? mediaType : null;
    case 'video/webm':
      return startsWith(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) ? mediaType : null;
    default:
      return null;
  }
}

function validatePortfolioFiles(files) {
  if (files.length > MAX_PORTFOLIO_MEDIA_FILES) {
    throw Object.assign(new Error(`Choose no more than ${MAX_PORTFOLIO_MEDIA_FILES} files.`), { status: 413 });
  }

  let totalSize = 0;
  for (const file of files) {
    if (!mediaTypeForFile(file)) {
      throw Object.assign(new Error('Use JPG, PNG, GIF, WebP, AVIF, MP4, MOV, or WebM files.'), { status: 400 });
    }
    if (file.size > MAX_PORTFOLIO_MEDIA_FILE_SIZE) {
      throw Object.assign(new Error('Each media file must be 8 MB or smaller.'), { status: 413 });
    }
    totalSize += file.size;
  }

  if (totalSize > MAX_PORTFOLIO_MEDIA_TOTAL_SIZE) {
    throw Object.assign(new Error('The combined media upload must be 25 MB or smaller.'), { status: 413 });
  }
}

module.exports = {
  MAX_PORTFOLIO_MEDIA_FILES,
  MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  MAX_PORTFOLIO_MEDIA_TOTAL_SIZE,
  mediaTypeForFile,
  mediaTypeForMime,
  validatePortfolioFiles,
};
