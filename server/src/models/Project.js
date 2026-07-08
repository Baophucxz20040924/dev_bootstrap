import mongoose from 'mongoose';

// One entry in a manifest: which module + which version to use.
const manifestStepSchema = new mongoose.Schema(
  {
    moduleSlug: { type: String, required: true },
    // "default" resolves to the module's defaultVersion at generate time.
    version: { type: String, default: 'default' },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    guide: { type: String, default: '' },
    // false = đang bảo trì (dev/devops thấy nhãn, không vào được; admin vẫn vào).
    enabled: { type: Boolean, default: true },
    // Role được xem project. devops/admin luôn thấy hết; field này quyết định dev.
    allowedRoles: { type: [String], default: ['dev', 'devops'] },
    version: { type: String, default: '1.0.0' },
    steps: { type: [manifestStepSchema], default: [] },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
export { manifestStepSchema };
