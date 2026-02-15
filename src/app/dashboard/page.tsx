"use client";
import React, { useEffect, useState, useCallback } from "react";
import { LayoutDashboard, Plus, FolderKanban, LogOut, Loader2, Trash2, Share2, BookOpen, X, Send, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState(""); 
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchProjects = useCallback(async () => {
    const storedId = localStorage.getItem("userId");
    if (!storedId) return;
    setFetching(true);
    try {
      // Owned aur Shared dono fetch honge [cite: 2026-02-14]
      const res = await fetch(`/api/projects?userId=${storedId}`); 
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error(err); } finally { setFetching(false); }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) { setUserId(storedId); fetchProjects(); }
    else { router.push("/login"); }
  }, [fetchProjects, router]);

  const handleOpenWorkspace = (projectId: string, whiteboardId?: string) => {
    if (whiteboardId) {
      router.push(`/whiteboard/${whiteboardId}`);
    } else {
      // Agar whiteboard nahi hai toh project details page ya default whiteboard par bhejein [cite: 2026-02-14]
      router.push(`/dashboard/project/${projectId}`);
    }
  };

  const createProject = async () => {
    if (!projectName.trim() || !userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim(), description: projectDesc.trim(), ownerId: userId }),
      });
      if (res.ok) {
        setProjectName(""); setProjectDesc(""); setIsModalOpen(false); fetchProjects();
      }
    } catch (err) { alert("Network Error"); } finally { setLoading(false); }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      const res = await fetch(`/api/project-action/${id}`, { method: "DELETE" });
      if (res.ok) fetchProjects();
      else alert("Delete failed");
    } catch (err) { alert("Error deleting project"); }
  };

  const openShareModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedProjectId(id);
    setIsShareModalOpen(true);
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/project-action/${selectedProjectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Project shared successfully!");
        setShareEmail("");
        setIsShareModalOpen(false);
      } else {
        alert(data.error || "Sharing failed");
      }
    } catch (err) { alert("Network error"); } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <aside className="w-64 bg-[#1e293b] p-6 border-r border-slate-800 flex flex-col">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xl mb-10"><LayoutDashboard /> CollabHub</div>
        <div className="bg-blue-600/10 text-blue-400 p-3 rounded-xl flex items-center gap-3 font-medium cursor-default"><FolderKanban size={20} /> My Projects</div>
        <button onClick={() => { localStorage.clear(); router.push("/login"); }} className="mt-auto text-slate-400 hover:text-red-400 flex items-center gap-2 pt-5 border-t border-slate-700/50 transition-colors"><LogOut size={20} /> Logout</button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold">Projects</h1>
            <p className="text-slate-400 mt-2">Manage your workspaces and collaborations</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"><Plus /> New Project</button>
        </header>

        {fetching ? (
          <div className="flex flex-col items-center mt-20 gap-4">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-slate-400">Loading your workspace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length === 0 && (
              <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                <p className="text-slate-500">No projects found. Create your first one!</p>
              </div>
            )}
            {projects.map((p) => (
              <div key={p.id} className="bg-[#1e293b]/50 p-6 rounded-3xl border border-slate-800 hover:border-blue-500 transition-all group relative flex flex-col min-h-[200px]">
                <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openShareModal(e, p.id)} className="p-2 bg-slate-800/80 hover:bg-blue-600 rounded-full backdrop-blur-sm transition-all shadow-xl"><Share2 size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="p-2 bg-slate-800/80 hover:bg-red-600 rounded-full backdrop-blur-sm transition-all shadow-xl"><Trash2 size={16} /></button>
                </div>
                
                <h3 className="text-xl font-bold mb-1 truncate pr-16">{p.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 break-words flex-1">{p.description || "No description provided."}</p>
                
                <div className="pt-4 mt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${p.ownerId === userId ? 'text-blue-400' : 'text-green-400'}`}>
                      {p.ownerId === userId ? "Owner" : `Shared by ${p.owner?.username || "User"}`}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleOpenWorkspace(p.id, p.whiteboards?.[0]?.id)}
                    className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors uppercase tracking-tight"
                  >
                    <BookOpen size={14} /> Open Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-8 rounded-[2rem] w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Share2 className="text-blue-400" /> Share Project</h2>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <p className="text-slate-400 mb-6 text-sm">Enter the username of the person you want to collaborate with.</p>
            <input className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 text-white" 
                   placeholder="username" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} />
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsShareModalOpen(false)} className="flex-1 bg-slate-700 py-4 rounded-2xl font-bold">Cancel</button>
              <button onClick={handleShare} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Share Now</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1e293b] p-8 rounded-[2rem] w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Create New Project</h2>
            <div className="space-y-4">
              <input className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500 text-white" 
                     placeholder="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              <textarea className="w-full bg-[#0f172a] border border-slate-700 p-4 rounded-2xl h-28 outline-none focus:border-blue-500 text-white resize-none" 
                        placeholder="Description (Optional)" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-700 py-4 rounded-2xl font-bold">Cancel</button>
              <button onClick={createProject} disabled={loading || !projectName.trim()} className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}