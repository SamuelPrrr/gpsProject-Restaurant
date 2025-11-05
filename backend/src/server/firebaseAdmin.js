import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serviceAccountPath =
  process.env.SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, "serviceAccountKey.json");

let serviceAccount;

try {
  const fileContent = fs.readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(fileContent);
} catch (error) {
  console.error("❌ No se pudo leer el archivo de credenciales:", error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { admin, db };
