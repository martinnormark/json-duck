import useFileStore from "@/domain/file-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

function FileList() {
  const files = useFileStore((state) => state.files);

  return (
    <>
      <p>We currently have {files.length} files in the store</p>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </>
  );
}

export default FileList;
