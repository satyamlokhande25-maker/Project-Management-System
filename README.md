A full-stack, real-time workspace designed for teams to manage projects and brainstorm on digital whiteboards simultaneously.

## 📝 1. Project Overview
This platform allows users to create projects, manage multiple whiteboards within them, and share access with teammates using just their username. It features a seamless, real-time drawing experience where changes are synced instantly across all users.

**Technology Stack:**
* **Framework:** Next.js (App Router)
* **Database:** PostgreSQL with Prisma ORM
* **Whiteboard Engine:** TLDraw SDK
* **Real-time Engine:** Socket.io (WebSockets)
* **Styling:** Tailwind CSS

## 📊 2. Database Schema
The project uses a structured relational database to handle users and collaboration permissions.

* **User:** Manages identity via unique usernames.
* **Project:** Central entity owned by a user; contains metadata and settings.
* **ProjectShare:** A junction table handling the many-to-many relationship for shared access.
* **Whiteboard:** Stores the canvas state (JSON) linked to a specific project.
* **Relationships:** A Project is linked to one Owner (User) and can have many Members (via ProjectShare).



---

## ⚙️ 3. Setup Instructions

### Prerequisites
* Node.js (v18+)
* PostgreSQL instance (Local or Cloud-hosted like Supabase)

### Installation & Setup
1.  **Clone the Repo:**
    ```bash
    git clone <your-repo-link>
    cd <project-folder>
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Rename `.env.example` to `.env` and add your database credentials.
4.  **Database Migration:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Run Locally:**
    ```bash
    npm run dev
    ```

---

## 🧪 4. Testing Guide

To verify all core features, follow this flow:

1.  **Auth Test:** Login as `Satyam`. If the user doesn't exist, the system auto-creates it.
2.  **Project CRUD:** Create a new project, then create a "New Board" inside it.
3.  **Auto-Save:** Draw on the canvas, refresh the page, and verify the drawing persists.
4.  **Sharing Logic:** * Open an Incognito window and login as `Shivam`.
    * In `Satyam`'s window, click **Share**, enter `shivam`, and confirm.
    * Verify `shivam` sees the project on his dashboard with a "Shared by Satyam" badge.
5.  **Real-time Sync:** Open the same board in both windows and draw simultaneously to see live synchronization.

---

## 🚀 5. Deployment
* **Live URL:** [Paste your Vercel Link here]
* **Deployment Notes:** * Hosted on **Vercel** with a **Supabase** backend.
    * Environment variables must be configured in the Vercel Dashboard.
    * Ensure `NEXT_PUBLIC_SOCKET_URL` matches the production domain.
