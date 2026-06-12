import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

export function useFirestore(uid) {
  const [data, setData] = useState({
    certs: [],
    basic: [],
    education: [],
    career: [],
    projects: [],
    coursework: [],
    free: [],
  });
  const [loading, setLoading] = useState(true);

  const COLLECTIONS = ["certs", "basic", "education", "career", "projects", "coursework", "free"];

  useEffect(() => {
    if (!uid) return;

    const unsubs = COLLECTIONS.map((col) => {
      const ref = collection(db, "users", uid, col);
      return onSnapshot(ref, (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setData((prev) => ({ ...prev, [col]: items }));
        setLoading(false);
      });
    });

    return () => unsubs.forEach((u) => u());
  }, [uid]);

  const addItem = async (col, item) => {
    const ref = doc(collection(db, "users", uid, col));
    await setDoc(ref, { ...item, order: Date.now() });
  };

  const updateItem = async (col, id, item) => {
    const ref = doc(db, "users", uid, col, id);
    await setDoc(ref, item, { merge: true });
  };

  const deleteItem = async (col, id) => {
    const ref = doc(db, "users", uid, col, id);
    await deleteDoc(ref);
  };

  return { data, loading, addItem, updateItem, deleteItem };
}