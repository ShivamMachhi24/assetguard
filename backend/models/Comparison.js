const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema(
  {
    // Original uploaded file name (for display in history UI)
    originalName: {
      type: String,
      required: [true, 'Original image name is required'],
      trim: true,
    },

    // Suspected file name
    suspectedName: {
      type: String,
      required: [true, 'Suspected image name is required'],
      trim: true,
    },

    // Raw perceptual hash hex strings (useful for future re-analysis)
    originalHash: {
      type: String,
      required: [true, 'Original image hash is required'],
    },

    suspectedHash: {
      type: String,
      required: [true, 'Suspected image hash is required'],
    },

    // Raw Hamming distance between hashes (stored for auditability)
    hammingDistance: {
      type: Number,
      required: true,
      min: 0,
      max: 64,
    },

    // Computed similarity percentage (0–100)
    similarity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Verdict
    status: {
      type: String,
      required: true,
      enum: ['Authorized', 'Unauthorized'],
    },
  },
  {
    // Automatically adds createdAt + updatedAt fields
    timestamps: true,

    // Clean up the JSON output: remove __v, rename _id → id
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index: newest first — used by GET /api/v1/history
comparisonSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Comparison', comparisonSchema);
