import { z } from 'zod';

// Run a schema and collapse errors into a { field: message } map (first per field).
export function validate(schema, data) {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, values: r.data, errors: {} };
  const errors = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] ?? '_';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, values: null, errors };
}

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');
const password = z.string().min(8, 'At least 8 characters').max(72, 'Password is too long');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email,
  password,
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export const forgotSchema = z.object({ email });

export const resetSchema = z.object({
  password,
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

// Topic "name" field: letters/numbers/spaces only (no stray symbols), length-capped.
export const topicNameSchema = z.string().trim()
  .min(1, 'Enter a topic')
  .max(40, 'Max 40 characters')
  .regex(/^[A-Za-z0-9 &/+-]+$/, 'Use letters, numbers and spaces only');

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour)');

// A single metric value (impressions/reactions/comments): whole number, not negative.
export const metricSchema = z.coerce.number().int('Whole numbers only').min(0, 'Cannot be negative');

export const settingsSchema = z.object({
  topics: z.string().max(500, 'Too long (max 500 characters)'),
  tone: z.string().max(600, 'Too long (max 600 characters)'),
  hashtags: z.string().max(200, 'Too long (max 200 characters)'),
  default_post_time: timeSchema,
});
