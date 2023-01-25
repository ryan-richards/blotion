import crypto from "crypto";

const key = process.env.NOTION_HASH_KEY ? process.env.NOTION_HASH_KEY : "";
const iv = process.env.NOTION_HASH_IV ? process.env.NOTION_HASH_IV : "";
const keyHash = crypto
  .createHash("sha512")
  .update(key, "utf-8")
  .digest("hex")
  .substr(0, 32);
const ivHash = crypto
  .createHash("sha512")
  .update(iv, "utf-8")
  .digest("hex")
  .substr(0, 16);

export const encryptAPIKey = async (apiKey: string) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", keyHash, ivHash);
  let encrypted = cipher.update(apiKey, "utf8", "hex") + cipher.final("hex");

  return encrypted;
};

export const decryptAPIKey = async (encryptedAPIKey: string) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyHash, ivHash);
  let decrypted =
    decipher.update(encryptedAPIKey, "hex", "utf8") + decipher.final("utf8");
  return decrypted;
};
