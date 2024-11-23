import { create } from "zustand";

export interface FileRecord {
  id?: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
}

interface FilesState {
  files: FileRecord[];
  add: (file: FileRecord) => void;
}

export type FileStore = FilesState;

const useFileStore = create<FilesState>()((set) => ({
  files: [],
  initialize: (files: FileRecord[]) => set({ files }),
  add: (file) => set((state) => ({ files: [...state.files, file] })),
}));

export default useFileStore;
