const sharp = require('sharp');

/**
 * Precomputes the 32x32 DCT Matrix
 */
const N = 32;
const DCT_MATRIX = Array.from({ length: N }, (_, i) => {
  const row = new Float64Array(N);
  const factor = i === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
  for (let j = 0; j < N; j++) {
    row[j] = factor * Math.cos(((2 * j + 1) * i * Math.PI) / (2 * N));
  }
  return row;
});

/**
 * Performs 2D DCT using Matrix Multiplication: DCT = T * M * T'
 */
function applyDCT2D(matrix) {
  const size = 32;
  const temp = Array.from({ length: size }, () => new Float64Array(size));
  const result = Array.from({ length: size }, () => new Float64Array(size));

  // Temp = T * M
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += DCT_MATRIX[i][k] * matrix[k][j];
      }
      temp[i][j] = sum;
    }
  }

  // Result = Temp * T'
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += temp[i][k] * DCT_MATRIX[j][k]; // T'[k,j] is T[j,k]
      }
      result[i][j] = sum;
    }
  }

  return result;
}

/**
 * Generates a 64-bit Perceptual Hash (pHash) using DCT.
 */
async function generateHash(input) {
  try {
    const { data } = await sharp(input)
      .resize(32, 32, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 1. Create 32x32 matrix correctly from Uint8 buffer (Subtract 128 for DC centering)
    const matrix = [];
    for (let i = 0; i < 32; i++) {
      const row = new Float64Array(32);
      for (let j = 0; j < 32; j++) {
        row[j] = data[i * 32 + j] - 128;
      }
      matrix.push(row);
    }

    // 2. Apply 2D DCT
    const dctMatrix = applyDCT2D(matrix);

    // 3. Extract top-left 8x8 block
    const flat8x8 = new Float64Array(64);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        flat8x8[i * 8 + j] = dctMatrix[i][j];
      }
    }

    // 4. Compute median of AC (exclude 0,0)
    const acValues = flat8x8.slice(1);
    const sorted = [...acValues].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    // 5. Generate bits (Exactly 64 bits)
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += flat8x8[i] > median ? '1' : '0';
    }

    return hash;
  } catch (error) {
    console.error('[pHashError]:', error.message);
    throw error;
  }
}

/**
 * Similarity via Hamming Distance
 */
function compareHashes(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== 64 || hash2.length !== 64) {
    return { similarity: 0, distance: 64 };
  }
  
  let dist = 0;
  for (let i = 0; i < 64; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }

  const similarity = Math.round(((64 - dist) / 64) * 100);

  // Debug Logs
  console.log("---- Similarity Engine ----");
  console.log("Distance:", dist);
  console.log("Similarity:", similarity + "%");

  return { 
    similarity, 
    distance: dist 
  };
}

module.exports = { generateHash, compareHashes };
