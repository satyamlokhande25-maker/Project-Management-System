# Project Management & Real-Time Whiteboard

A full-stack collaborative workspace where teams can manage projects, share access, and work together on real-time digital whiteboards.

## Overview

The application combines project management with real-time collaboration. Users can create projects, create multiple whiteboards, share projects with teammates, and synchronize canvas changes across connected clients.

## Key Features

- User identity and login flow
- Project creation and management
- Multiple whiteboards per project
- Project sharing and access control
- Real-time canvas synchronization
- Persistent whiteboard state
- PostgreSQL persistence through Prisma

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, App Router, Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Whiteboard | TLDraw SDK |
| Real-time | Socket.io / WebSockets |

## Architecture

```text
Next.js Client
     ↓
Application Routes / Server Logic
     ↓
Prisma ORM → PostgreSQL
     ↓
Project / User / Share / Whiteboard Data

Connected Clients
     ↕
Socket.io WebSocket Layer
     ↕
Real-Time Whiteboard Events
```

## Data Model

- **User** — application identity
- **Project** — project owned by a user
- **ProjectShare** — project access relationship
- **Whiteboard** — persistent canvas state associated with a project

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
git clone https://github.com/satyamlokhande25-maker/Project-Management-System.git
cd Project-Management-System
npm install
```

Configure the required environment variables, then initialize Prisma:

```bash
npx prisma generate
npx prisma db push
```

Start the application:

```bash
npm run dev
```

## Validation Checklist

- Sign in with a test user
- Create a project and whiteboard
- Refresh and verify persistence
- Share the project with another test user
- Open the same board in two sessions
- Draw in one session and verify real-time synchronization

## Security Considerations

Use environment variables for database credentials and deployment secrets. Apply server-side authorization checks to project and whiteboard operations; do not rely only on client-side visibility.

## Deployment

The original project documentation describes a hosted deployment using Railway/Supabase. For production, configure database, WebSocket, and application environment variables through the deployment platform.

## Future Enhancements

- Role-based project permissions
- Automated tests
- Audit logging
- Presence indicators
- Version history for whiteboards
- CI/CD with protected main branch

## Author

**Satyam Lokhande**  
GitHub: https://github.com/satyamlokhande25-maker
