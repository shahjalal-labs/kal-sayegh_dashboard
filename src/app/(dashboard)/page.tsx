"use client"

// pages/index.tsx or pages/index.js
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /login when the page loads
    router.push("/login");
  }, [router]);

  return null; // Don't render anything since it's just a redirect
}
