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

export type ResourceType = "book" | "pdf" | "announcement" | "journal";

export type LibraryResource = {
  id: string;
  title: string;
  type: ResourceType;
  author?: string;
  available: boolean;
  description?: string;
  addedAt: Timestamp;
  updatedAt: Timestamp;
};

export type NewLibraryResource = Omit<LibraryResource, "id" | "addedAt" | "updatedAt">;

const COLLECTION = "library";

export function subscribeLibrary(
  onUpdate: (items: LibraryResource[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COLLECTION), orderBy("addedAt", "desc"));
  return onSnapshot(
    q,
    (snap) =>
      onUpdate(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as LibraryResource))
      ),
    onError
  );
}

export async function addLibraryResource(data: NewLibraryResource): Promise<void> {
  const now = Timestamp.now();
  await addDoc(collection(db, COLLECTION), {
    ...data,
    addedAt: now,
    updatedAt: now,
  });
}

export async function updateLibraryResource(
  id: string,
  data: Partial<NewLibraryResource>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteLibraryResource(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
