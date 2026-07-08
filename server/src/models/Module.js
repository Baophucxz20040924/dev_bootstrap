import mongoose from 'mongoose';

// A Module handles exactly one responsibility (e.g. install docker).
// It exposes lifecycle steps per platform through its versions.
const moduleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // Free-form grouping: tool | mcp | config
    category: { type: String, enum: ['tool', 'mcp', 'config'], default: 'tool' },
    tags: { type: [String], default: [] },
    // Points at the ModuleVersion currently treated as "stable"/default.
    defaultVersion: { type: String, default: '1.0.0' },
  },
  { timestamps: true }
);

export const Module = mongoose.model('Module', moduleSchema);
