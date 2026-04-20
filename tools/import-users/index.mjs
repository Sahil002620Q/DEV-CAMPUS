import fs from "node:fs";
import Papa from "papaparse";
import admin from "firebase-admin";

function rollToEmail(rollNumber) {
  return `${String(rollNumber).trim().toUpperCase()}@campus.local`.toLowerCase();
}

function makeAlias(rollNumber) {
  const rn = String(rollNumber).trim().toUpperCase();
  const n = rn.slice(-3) || "000";
  return `Campus-${n}`;
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  throw new Error(
    "Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON path."
  );
}

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

const csvPath = process.argv[2] ?? "users.csv";
const csv = fs.readFileSync(csvPath, "utf8");

const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
if (parsed.errors?.length) {
  console.error(parsed.errors);
  process.exit(1);
}

const rows = parsed.data;

for (const row of rows) {
  const rollNumber = String(row.rollNumber ?? "").trim();
  const realName = String(row.realName ?? "").trim();
  const role = String(row.role ?? "student").trim();
  const classId = String(row.classId ?? "").trim();
  const tempPassword = String(row.tempPassword ?? "").trim();

  if (!rollNumber || !tempPassword) {
    console.log("Skipping row (missing rollNumber/tempPassword):", row);
    continue;
  }

  const email = rollToEmail(rollNumber);

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch {
    userRecord = await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: makeAlias(rollNumber),
      disabled: false
    });
  }

  const uid = userRecord.uid;

  await db
    .collection("users")
    .doc(uid)
    .set(
      {
        rollNumber,
        realName,
        alias: makeAlias(rollNumber),
        role,
        classId,
        mustChangePassword: true,
        privacy: { showRealName: false },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: null
      },
      { merge: true }
    );

  console.log(`OK ${rollNumber} -> ${uid}`);
}

console.log("Import complete.");

