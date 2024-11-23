import { CloudUpload } from "lucide-react";
import FileList from "./components/file-list";
import { Button } from "./components/ui/button";
import useFileStore from "./domain/file-store";

function AppRoot() {
  const fileStore = useFileStore((state) => state);

  return (
    <>
      <FileList />
      <Button
        onClick={() =>
          fileStore.add({
            fileName: "test",
            fileType: "json",
            fileSize: 100,
            uploadDate: new Date(),
          })
        }
      >
        Add file
      </Button>

      <div>
        <label
          for="dropzone-file"
          className="flex flex-col items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center">
            <CloudUpload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <input id="dropzone-file" type="file" className="hidden" />
        </label>
      </div>
    </>
  );
}

export default AppRoot;
