"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, FileText, Loader2, Share2, Trash2, X, Send, Crown } from "lucide-react"; // Crown icon added
import { useRouter, useParams } from "next/navigation";

export default function ProjectWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const [whiteboards, setWhiteboards] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any>(null); // To store owner info [cite: 2026-02-14]
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUsername, setShareUsername] = useState("");
  const [newBoardName, setNewBoardName] = useState("");

  const fetchWorkspaceData = useCallback(async () => {
    if (!projectId) return;
    try {
      // Boards fetch karo
      const resBoards = await fetch(`/api/whiteboard?projectId=${projectId}`);
      const boardsData = await resBoards.json();
      setWhiteboards(Array.isArray(boardsData) ? boardsData : []);

      // Project aur Owner info fetch karo [cite: 2026-02-14]
      const resProj = await fetch(`/api/projects/${projectId}`);
      if (resProj.ok) {
        const proj = await resProj.json();
        setProjectData(proj);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchWorkspaceData();
    // Simple way to get current user from localStorage/session
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUserId(user.id);
  }, [fetchWorkspaceData]);

  const createNewBoard = async () => {
    const title = newBoardName.trim() || "Untitled Drawing";
    setCreating(true);
    try {
      const res = await fetch("/api/whiteboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, projectId }),
      });
      if (res.ok) {
        setNewBoardName("");
        fetchWorkspaceData();
      }
    } catch (err) { alert("Network Error"); } finally { setCreating(false); }
  };

  const deleteBoard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Only owner check [cite: 2026-02-14]
    if (projectData?.ownerId !== currentUserId) {
      alert("Only project owners can delete whiteboards.");
      return;
    }
    if (!confirm("Delete this drawing?")) return;
    try {
      const res = await fetch(`/api/whiteboard/${id}`, { method: "DELETE" });
      if (res.ok) fetchWorkspaceData();
    } catch (err) { alert("Delete failed"); }
  };

  const handleShare = async () => {
    if (!shareUsername.trim()) return;
    // Check if current user is owner [cite: 2026-02-14]
    if (projectData?.ownerId !== currentUserId) {
      alert("Only owners can manage sharing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/project/share", { // Updated path to match our new API
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, username: shareUsername.trim() }),
      });
      if (res.ok) {
        alert("Project shared successfully!");
        setIsShareModalOpen(false);
        setShareUsername("");
      } else {
        const data = await res.json();
        alert(data.error || "User not found");
      }
    } catch (err) { alert("Network error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{projectData?.name || "Project Workspace"}</h1>
            <div className="flex items-center gap-2 mt-1">
               <Crown size={14} className="text-yellow-500" />
               <p className="text-slate-400 text-sm">Owner: <span className="text-blue-400 font-medium">{projectData?.owner?.username || "Loading..."}</span></p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl outline-none focus:border-blue-500 text-sm flex-1 md:w-48 text-white"
            placeholder="Board name..."
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <button 
            onClick={createNewBoard}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {creating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            New Board
          </button>
          
          {/* Share button only visible/active for owners [cite: 2026-02-14] */}
          {projectData?.ownerId === currentUserId && (
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Share2 size={18} /> Share
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : whiteboards.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <FileText className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500">No drawings yet. Add your first whiteboard above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whiteboards.map((board: any) => (
              <div 
                key={board.id}
                onClick={() => router.push(`/whiteboard/${board.id}`)}
                className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group relative"
              >
                {/* Delete button logic for owner [cite: 2026-02-14] */}
                {projectData?.ownerId === currentUserId && (
                  <button 
                    onClick={(e) => deleteBoard(e, board.id)}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 w-fit mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1 truncate pr-8">{board.title || "Untitled"}</h3>
                <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                  Updated: {new Date(board.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal Logic Same, just ensured it hits the right API [cite: 2026-02-14] */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-8 rounded-[2rem] w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Share2 className="text-blue-400" /> Share Project</h2>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Enter the username of the person you want to collaborate with.</p>
            <input className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 text-white mb-6" 
                   placeholder="Enter username" value={shareUsername} onChange={(e) => setShareUsername(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setIsShareModalOpen(false)} className="flex-1 bg-slate-700 py-3 rounded-2xl font-bold">Cancel</button>
              <button onClick={handleShare} className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
                <Send size={18} /> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}