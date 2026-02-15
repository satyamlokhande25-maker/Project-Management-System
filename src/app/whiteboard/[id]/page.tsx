"use client";
import React, { useEffect, useState, useRef } from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CloudCheck, CloudUpload, Loader2, Users } from "lucide-react";
import { io, Socket } from "socket.io-client";

export default function WhiteboardPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  
  const [editor, setEditor] = useState<Editor | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<"saved" | "saving" | "error">("saved");
  const socketRef = useRef<Socket | null>(null);
  const isLoaded = useRef(false);

  // 1. Socket Connection & Real-time Sync [cite: 2026-02-14]
  useEffect(() => {
    if (!id) return;

    // Connect to our custom server
    socketRef.current = io();

    socketRef.current.emit("join-board", id);

    // Jab doosre user se update aaye [cite: 2026-02-14]
    socketRef.current.on("receive-update", (update: any) => {
      if (editor) {
        editor.store.mergeRemoteChanges(() => {
          editor.store.put(Object.values(update.changes.added));
          editor.store.put(Object.values(update.changes.updated).map((u: any) => u[1]));
          editor.store.remove(Object.values(update.changes.removed).map((r: any) => r.id));
        });
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id, editor]);

  // 2. Load Initial Data
  useEffect(() => {
    async function initCanvas() {
      if (!id || !editor || isLoaded.current) return;
      try {
        const res = await fetch(`/api/whiteboard/${id}`);
        if (res.ok) {
          const whiteboard = await res.json();
          if (whiteboard.projectId) setProjectId(whiteboard.projectId);
          if (whiteboard.data) {
            const snapshot = typeof whiteboard.data === "string" ? JSON.parse(whiteboard.data) : whiteboard.data;
            if (snapshot && Object.keys(snapshot).length > 0) editor.loadSnapshot(snapshot);
          }
        }
      } catch (err) { console.error(err); } finally { isLoaded.current = true; setLoading(false); }
    }
    initCanvas();
  }, [id, editor]);

  // 3. Listen to Changes & Broadcast + Auto-save [cite: 2026-02-14, 2026-02-15]
  useEffect(() => {
    if (!editor || !id) return;

    const cleanup = editor.store.listen((event) => {
      if (event.source !== "user") return; // Sirf user ke changes broadcast karo

      // Socket par bhejdo (Real-time sync) [cite: 2026-02-14]
      socketRef.current?.emit("draw-update", {
        boardId: id,
        update: event
      });

      // Auto-save logic (Database update) [cite: 2026-02-15]
      setSavingStatus("saving");
      const timeout = setTimeout(async () => {
        try {
          const snapshot = editor.getSnapshot();
          const res = await fetch(`/api/whiteboard/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: snapshot }),
          });
          if (res.ok) setSavingStatus("saved");
        } catch (err) { setSavingStatus("error"); }
      }, 3000);

      return () => clearTimeout(timeout);
    }, { source: "user", scope: "document" });

    return () => cleanup();
  }, [editor, id]);

  const handleBack = () => projectId ? router.push(`/dashboard/project/${projectId}`) : router.push("/dashboard");

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0f172a]">
      <div className="bg-[#1e293b] p-3 flex justify-between items-center border-b border-slate-700 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-none mb-1">Live Collaborative Board</span>
            <div className="flex items-center gap-1.5">
              {savingStatus === "saving" && <><Loader2 size={12} className="animate-spin text-blue-400" /> <span className="text-[10px] text-blue-400 font-medium">Syncing...</span></>}
              {savingStatus === "saved" && <><CloudCheck size={12} className="text-emerald-400" /> <span className="text-[10px] text-emerald-400 font-medium">Live & Saved</span></>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
           <Users size={14} className="text-blue-400" />
           <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Multi-User Active</span>
        </div>
      </div>

      <div className="flex-grow relative">
        <Tldraw onMount={(editor) => setEditor(editor)} inferDarkMode={true} />
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a]">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={50} />
            <p className="text-slate-300 font-medium">Connecting to Live Session...</p>
          </div>
        )}
      </div>
    </div>
  );
}