// crypto-shim.js
// 这个文件解决 node:crypto 模块在 Cloudflare Workers 中的兼容性问题
import * as cryptoBrowserify from 'crypto-browserify';

export default cryptoBrowserify;
export const createHash = cryptoBrowserify.createHash;
export const createHmac = cryptoBrowserify.createHmac;
export const randomBytes = cryptoBrowserify.randomBytes;
export const createCipheriv = cryptoBrowserify.createCipheriv;
export const createDecipheriv = cryptoBrowserify.createDecipheriv;
export const pbkdf2 = cryptoBrowserify.pbkdf2;
export const pbkdf2Sync = cryptoBrowserify.pbkdf2Sync; 