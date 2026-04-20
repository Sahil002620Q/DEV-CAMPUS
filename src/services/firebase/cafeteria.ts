import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./client";

export type MenuCategory = "breakfast" | "lunch" | "snack" | "dinner" | "drinks";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  available: boolean;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type NewMenuItem = Omit<MenuItem, "id" | "createdAt" | "updatedAt">;

const COLLECTION = "cafeteria_menu";

export function subscribeCafeteriaMenu(
  onUpdate: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) =>
      onUpdate(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem))
      ),
    onError
  );
}

export async function addMenuItem(data: NewMenuItem): Promise<void> {
  const now = Timestamp.now();
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateMenuItem(
  id: string,
  data: Partial<NewMenuItem>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
