const { generateHash, compareHashes } = require('./backend/utils/hashing');
const path = require('path');

async function test() {
  console.log('--- Detection Engine Verification ---');
  
  // Note: These paths are placeholders, I'll use them if I had the files.
  // Since I don't have images handy, I'll just check the logic with some manual calls
  // if I were to run this with the actual sharp binaries.
  
  try {
     console.log('Hashing Logic Loaded successfully.');
     // Mocking some binary strings for logic test
     const h1 = '1111000011110000111100001111000011110000111100001111000011110000';
     const h2 = '1111000011110000111100001111000011110000111100001111000011110011'; // distance 2
     
     const { similarity, distance } = compareHashes(h1, h2);
     console.log(`Similarity: ${similarity}% (Distance: ${distance})`);
     
     if (similarity > 80) console.log('PASS: Logic correctly identifies match.');
     else console.log('FAIL: Logic failed match test.');

  } catch (e) {
    console.error('Test Failed:', e.message);
  }
}

test();
