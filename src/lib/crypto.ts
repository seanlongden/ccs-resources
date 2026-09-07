import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

function getKey(): Buffer {
  const b64 = process.env.ADMIN_KEY_ENCRYPTION_SECRET;
  if (!b64) throw new Error('ADMIN_KEY_ENCRYPTION_SECRET is not set');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('ADMIN_KEY_ENCRYPTION_SECRET must decode to 32 bytes');
  return key;
}

export function encrypt(plaintext: string): { enc: string; iv: string; tag: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { enc: enc.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64') };
}

export function decrypt(enc: string, iv: string, tag: string): string {
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(enc, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}
