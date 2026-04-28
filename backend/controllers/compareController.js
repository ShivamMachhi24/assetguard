const { generateHash, compareHashes } = require('../utils/hashing');
const crypto     = require('crypto');

/**
 * Deterministic Intelligence Engine
 * Simulated platform scanning based on pHash seed for consistency.
 */
const simulateIntelligenceScan = (topMatch, suspectHash) => {
  const platforms = [
    { name: 'Instagram', baseUrl: 'https://instagram.com/p/' },
    { name: 'Twitter',   baseUrl: 'https://twitter.com/status/' },
    { name: 'Reddit',    baseUrl: 'https://reddit.com/r/asset_audit/' },
    { name: 'News Wells', baseUrl: 'https://news-intel.com/article/' }
  ];

  const similarity = topMatch ? topMatch.similarity : 0;
  
  // Deterministic seed from hash
  const seed = suspectHash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRand = (i) => ((Math.sin(seed + i) * 10000) % 1 + 1) % 1;

  return platforms.map((p, i) => {
    const val = seededRand(i);
    let status = 'clean';
    let confidence = Math.round(val * 40 + 10); // Base idle noise 10-50%
    
    if (similarity >= 80) {
      // 1-3 platforms match
      if (val > 0.4) {
        status = 'match';
        confidence = Math.round(similarity - (val * 5));
      }
    } else if (similarity >= 55) {
      // 1 platform possible
      if (val > 0.7) {
        status = 'possible';
        confidence = Math.round(similarity - (val * 10));
      }
    }

    const evidenceLevel = confidence > 90 ? 'STRONG' : confidence > 75 ? 'MODERATE' : 'WEAK';
    const fakeId = crypto.createHash('md5').update(suspectHash + p.name).digest('hex').slice(0, 10);
    
    return {
      platform: p.name,
      status,
      confidence,
      evidenceLevel,
      url: status !== 'clean' ? `${p.baseUrl}${fakeId}` : null,
      detectedAt: new Date().toISOString(),
      firstSeen: new Date(Date.now() - (val * 86400000 * 2)).toISOString(), // up to 2 days ago
    };
  });
};
// POST /api/v1/compare
// Upgraded to 1-vs-MANY Scanning
// ─────────────────────────────────────────────────────────────────────────────
const compareImages = async (req, res, next) => {
  // 1. GLOBAL DEBUG LOGS
  console.log("---- NEW REQUEST ----");
  console.log("Endpoint: POST /api/v1/compare");
  console.log("Files:", req.files ? Object.keys(req.files) : 'none');
  console.log("Registry size in body:", req.body?.registry ? JSON.parse(req.body.registry).length : 0);

  try {
    // 2. SAFE FILE EXTRACTION
    const suspectedFile = req.files?.suspectedImage?.[0];
    
    if (!suspectedFile) {
      return res.status(400).json({ error: "No suspected image provided" });
    }

    // 3. SAFE REGISTRY PARSING
    let registry = [];
    try {
      registry = JSON.parse(req.body.registry || "[]");
    } catch (e) {
      console.error("Registry parse failed:", e);
      return res.status(400).json({ error: "Invalid registry format" });
    }

    console.log("Processing registry of size:", registry.length);

    if (registry.length === 0) {
      return res.status(400).json({ error: 'Registry Empty: No assets to compare against.' });
    }

    // 4. PROTECTED HASHING (SUSPECT)
    let suspectHash;
    try {
      // support both buffer (memoryStorage) and path (diskStorage)
      suspectHash = await generateHash(suspectedFile.buffer || suspectedFile.path);
    } catch (e) {
      console.error("Hashing suspect failed:", e);
      return res.status(500).json({ error: "Neural engine failed to hash the suspect asset" });
    }

    if (!suspectHash || suspectHash.length !== 64) {
      return res.status(500).json({ error: 'Neural engine failed to generate valid pHash for suspect.' });
    }

    // 5. PROTECTED REGISTRY LOOP
    const matches = [];
    for (const asset of registry) {
      try {
        let assetHash = asset.pHash;
        
        // Recompute if missing or invalid
        if (!assetHash || assetHash.length !== 64) {
          if (asset.image) {
            const base64Data = asset.image.split(',')[1] || asset.image;
            const buffer = Buffer.from(base64Data, 'base64');
            assetHash = await generateHash(buffer);
          }
        }

        if (assetHash) {
          const { similarity, distance } = compareHashes(suspectHash, assetHash);

          let risk, status;
          if (similarity >= 80) {
            risk = "HIGH";
            status = "BREACH";
          } else if (similarity >= 55) {
            risk = "MEDIUM";
            status = "POSSIBLE";
          } else {
            risk = "LOW";
            status = "CLEAN";
          }

          console.log("FINAL DECISION:", similarity, status, risk);

          matches.push({
            id: asset.id,
            assetName: asset.name,
            image: asset.image,
            pHash: assetHash,
            similarity,
            distance,
            risk,
            status
          });
        }
      } catch (e) {
        console.error(`Registry item [${asset.name}] failed:`, e);
        continue; // skip bad item
      }
    }

    // 6. RANK AND SCAN
    const sortedMatches = matches.sort((a, b) => b.similarity - a.similarity);
    const topMatchResult = sortedMatches[0] || null;

    // Simulated Intelligence Scan (Deterministic)
    const platformResults = simulateIntelligenceScan(topMatchResult, suspectHash);

    // ── Memory storage: no disk cleanup needed ─────────────────────────

    // ── Response ──────────────────────────────────────────────────────────
    return res.json({ 
      matches: sortedMatches, 
      topMatch: topMatchResult, 
      platformResults,
      suspectHash
    });

  } catch (err) {
    console.error("CRITICAL ERROR:", err);

    return res.status(500).json({
      error: "Server processing failed",
      details: err.message
    });
  }
};

module.exports = { compareImages };
