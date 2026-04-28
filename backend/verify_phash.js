const { generateHash, compareHashes } = require('./utils/hashing');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('🚀 [pHash Verification Suite] Initializing...');

  const testDir = path.join(__dirname, 'test_tmp');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

  const originalPath = path.join(testDir, 'original.png');
  const compressedPath = path.join(testDir, 'compressed.jpg');
  const resizedPath = path.join(testDir, 'resized.png');
  const differentPath = path.join(testDir, 'different.png');

  try {
    // 1. Create Baseline Image (More complex pattern)
    await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 50, g: 50, b: 50 }
      }
    })
    .composite([
      { input: Buffer.from('<svg><rect x="0" y="0" width="150" height="150" fill="white" opacity="0.5"/></svg>'), top: 0, left: 0 },
      { input: Buffer.from('<svg><circle cx="200" cy="200" r="80" fill="gray" /></svg>'), top: 0, left: 0 }
    ])
    .png()
    .toFile(originalPath);

    // 2. Create Compressed Image (JPEG 30% quality)
    await sharp(originalPath)
      .jpeg({ quality: 30 })
      .toFile(compressedPath);

    // 3. Create Resized Image (Small 48x48)
    await sharp(originalPath)
      .resize(48, 48)
      .toFile(resizedPath);

    // 4. Create Completely Different Image (Inverse-ish pattern)
    await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 200, g: 200, b: 200 }
      }
    })
    .composite([{ input: Buffer.from('<svg><rect x="150" y="150" width="150" height="150" fill="black" /></svg>'), top: 0, left: 0 }])
    .png()
    .toFile(differentPath);

    // --- Generate Hashes ---
    console.log('⌛ Generating Perceptual Hashes...');
    const hOrig = await generateHash(originalPath);
    const hComp = await generateHash(compressedPath);
    const hResi = await generateHash(resizedPath);
    const hDiff = await generateHash(differentPath);

    console.log(`\n[Results]`);
    console.log(`Original Hash:   ${hOrig}`);
    
    // --- Compare ---
    const testMatch = compareHashes(hOrig, hOrig);
    const compMatch = compareHashes(hOrig, hComp);
    const resiMatch = compareHashes(hOrig, hResi);
    const diffMatch = compareHashes(hOrig, hDiff);

    console.log(`1. Self-Match:      ${testMatch.similarity}% (Distance: ${testMatch.distance})`);
    console.log(`2. Compressed (10%): ${compMatch.similarity}% (Distance: ${compMatch.distance})`);
    console.log(`3. Resized (50px):   ${resiMatch.similarity}% (Distance: ${resiMatch.distance})`);
    console.log(`4. Different Image:  ${diffMatch.similarity}% (Distance: ${diffMatch.distance})`);

    // --- Validation ---
    console.log('\n[Validation]');
    const pass = (
      testMatch.similarity === 100 &&
      compMatch.similarity >= 90 &&
      resiMatch.similarity >= 90 &&
      diffMatch.similarity < 40
    );

    if (pass) {
      console.log('✅ pHash implementation PASSED all robustness tests.');
    } else {
      console.error('❌ pHash implementation FAILED one or more tests.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Test Suite execution failed:', error.message);
  } finally {
    // Cleanup
    const files = [originalPath, compressedPath, resizedPath, differentPath];
    files.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
  }
}

runTests();
