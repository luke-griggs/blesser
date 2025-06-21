import { readUserSession } from "../auth/actions";
import DocumentEditor from "@/components/DocumentEditor";

export default async function EditorPage() {
  // Check authentication on the server
  await readUserSession();

  // Redirect if not authenticated
  // const { data } = await readUserSession();
  // if (!data.user) {
  //   redirect("/auth/login");
  // }

  // User is authenticated, render the document editor
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <DocumentEditor />
    </main>
  );
}
