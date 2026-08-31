import { Suspense } from "react";
import MessagesClient from "./MessagesClient";

function MessagesLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading messages...</p>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesClient />
    </Suspense>
  );
}