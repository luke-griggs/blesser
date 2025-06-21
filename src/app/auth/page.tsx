import { readUserSession } from "./actions";
import AuthButtons from "@/components/AuthButtons";
import Navbar from "@/components/Navbar";


export default async function Home() {
  const { data } = await readUserSession();
  const isAuthenticated = !!data.user;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      {/* {isAuthenticated ? ( */}
      <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-6xl font-bold text-blue-500 mb-8">
          Welcome to Rio
        </h2>
        <p className="text-xl font-semibold text-gray-500 dark:text-gray-300 max-w-2xl mb-10">
          Your AI-powered data analyst.
        </p>
        <AuthButtons isAuthenticated={isAuthenticated} />
      </div>
      {/* ) : ( */}
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Login to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Your AI-powered data analyst.
          </p>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
        </p>
        <div className="text-center text-5xl font-extrabold ...">
          DATA ANALYST
        </div>
      </div>
      {/* )} */}
    </main>
  );
}
