import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "./client";

export type UserRole = "student" | "cafeteria_admin" | "library_admin" | "super_admin";

export async function getUserRole(uid: string): Promise<UserRole> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return "student";
  return (snap.data()?.role as UserRole) ?? "student";
}

export async function assignRole(
  targetUid: string,
  role: UserRole,
  grantedByUid: string
): Promise<void> {
  await updateDoc(doc(db, "users", targetUid), { role });
  await setDoc(doc(db, "admin_roles", targetUid), {
    role,
    grantedBy: grantedByUid,
    grantedAt: Timestamp.now(),
  });
}
