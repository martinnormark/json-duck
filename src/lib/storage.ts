const DB_NAME = "FileStorageDB";
const STORE_NAME = "FilesStore";

// Function to store a file in IndexedDB with metadata
async function storeFile(file: File): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const fileData = reader.result;
      const fileRecord = {
        fileName: file.name,
        fileType: file.type,
        fileData: fileData,
        uploadDate: new Date(),
      };

      const transaction = db.transaction(STORE_NAME, "readwrite");
      const objectStore = transaction.objectStore(STORE_NAME);

      const addRequest = objectStore.add(fileRecord);

      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () =>
        reject(new Error("Failed to add file to IndexedDB"));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error("Failed to complete transaction"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// Function to get a file from IndexedDB by its key
async function getFile(key: number): Promise<FileRecord | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const getRequest = objectStore.get(key);

    getRequest.onsuccess = () => resolve(getRequest.result || null);
    getRequest.onerror = () =>
      reject(new Error("Failed to get file from IndexedDB"));
  });
}

// Function to remove a file from IndexedDB by its key
async function removeFile(key: number): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    const deleteRequest = objectStore.delete(key);

    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () =>
      reject(new Error("Failed to remove file from IndexedDB"));
  });
}

// Function to get all stored files metadata from IndexedDB
async function getAllStoredFiles(): Promise<FileRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
    getAllRequest.onerror = () =>
      reject(new Error("Failed to get files from IndexedDB"));
  });
}

// Helper function to open the database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event: Event) =>
      resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = () => reject(new Error("Failed to open IndexedDB"));
  });
}

interface FileRecord {
  id?: number;
  fileName: string;
  fileType: string;
  fileData: ArrayBuffer | string | null;
  uploadDate: Date;
}

export { storeFile, getFile, removeFile, getAllStoredFiles };
