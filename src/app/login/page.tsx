"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return alert("Naam toh likho!");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      const user = await res.json();
      localStorage.setItem("userId", user.id); 
      router.push("/dashboard");
    } else {
      alert("Login fail ho gaya!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <form onSubmit={handleLogin} className="p-10 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Project Manager</h1>
        <input 
          className="p-3 rounded bg-black border border-zinc-700 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="Enter Username" 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <button type="submit" className="bg-blue-600 p-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
          Enter Workspace
        </button>
      </form>
    </div>
  );
}