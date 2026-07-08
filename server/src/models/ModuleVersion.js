import mongoose from 'mongoose';

// Platform-specific shell snippets for one lifecycle step.
// `detect` returns non-zero when the thing is missing (so install runs).
const platformStepsSchema = new mongoose.Schema(
  {
    detect: { type: String, default: '' },
    install: { type: String, default: '' },
    verify: { type: String, default: '' },
    rollback: { type: String, default: '' },
    // Extra steps some modules need (claude: login/config, mcp: register)
    config: { type: String, default: '' },
  },
  { _id: false }
);

const moduleVersionSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    version: { type: String, required: true },
    channel: { type: String, enum: ['latest', 'stable', 'legacy'], default: 'stable' },
    // Env vars this module needs. { KEY: { required, prompt, default } }
    // `default` is offered at prompt time so the user can just press Enter.
    env: {
      type: Map,
      of: new mongoose.Schema({ required: Boolean, prompt: String, default: String }, { _id: false }),
      default: {},
    },
    bash: { type: platformStepsSchema, default: () => ({}) },
    powershell: { type: platformStepsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

moduleVersionSchema.index({ module: 1, version: 1 }, { unique: true });

export const ModuleVersion = mongoose.model('ModuleVersion', moduleVersionSchema);
