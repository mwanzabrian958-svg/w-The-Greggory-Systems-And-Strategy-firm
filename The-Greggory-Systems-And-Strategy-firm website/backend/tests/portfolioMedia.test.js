const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MAX_PORTFOLIO_MEDIA_FILES,
  MAX_PORTFOLIO_MEDIA_FILE_SIZE,
  MAX_PORTFOLIO_MEDIA_TOTAL_SIZE,
  mediaTypeForFile,
  mediaTypeForMime,
  validatePortfolioFiles,
} = require('../utils/portfolioMedia');

const imageFile = (mimetype, size) => ({
  mimetype,
  size,
  buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
});
const videoFile = (mimetype, size) => ({
  mimetype,
  size,
  buffer: Buffer.from([0x1a, 0x45, 0xdf, 0xa3]),
});

test('classifies supported image and video types and rejects other types', () => {
  assert.equal(mediaTypeForMime('image/jpeg'), 'image');
  assert.equal(mediaTypeForMime('video/mp4'), 'video');
  assert.equal(mediaTypeForMime('application/pdf'), null);
  assert.equal(mediaTypeForFile(imageFile('image/png', 8)), 'image');
  assert.equal(mediaTypeForFile(videoFile('video/webm', 4)), 'video');
  assert.equal(mediaTypeForFile(imageFile('image/jpeg', 8)), null);
});

test('accepts multiple uploads within the configured limits', () => {
  assert.doesNotThrow(() => validatePortfolioFiles([
    imageFile('image/png', MAX_PORTFOLIO_MEDIA_FILE_SIZE),
    videoFile('video/webm', MAX_PORTFOLIO_MEDIA_FILE_SIZE),
    imageFile('image/png', MAX_PORTFOLIO_MEDIA_FILE_SIZE),
  ]));
});

test('rejects unsupported media types and excessive counts or sizes', () => {
  assert.throws(
    () => validatePortfolioFiles([{ ...imageFile('application/pdf', 1), buffer: Buffer.from('not pdf') }]),
    /Use JPG, PNG/
  );
  assert.throws(
    () => validatePortfolioFiles(Array.from({ length: MAX_PORTFOLIO_MEDIA_FILES + 1 }, () => ({
      ...imageFile('image/png', 1),
    }))),
    /no more than/
  );
  assert.throws(
    () => validatePortfolioFiles([imageFile('image/png', MAX_PORTFOLIO_MEDIA_FILE_SIZE + 1)]),
    /8 MB or smaller/
  );
  assert.throws(
    () => validatePortfolioFiles([
      imageFile('image/png', MAX_PORTFOLIO_MEDIA_FILE_SIZE),
      imageFile('image/png', MAX_PORTFOLIO_MEDIA_FILE_SIZE),
      imageFile('image/png', MAX_PORTFOLIO_MEDIA_FILE_SIZE),
      videoFile('video/webm', 2 * 1024 * 1024),
    ]),
    /combined media upload/
  );
});
