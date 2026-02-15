import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("🚀 User Connected:", socket.id);

    socket.on("join-board", (boardId) => {
      socket.join(boardId);
      console.log(`User joined board: ${boardId}`);
    });

    socket.on("draw-update", ({ boardId, update }) => {
      socket.to(boardId).emit("receive-update", update);
    });

    socket.on("disconnect", () => {
      console.log("❌ User Disconnected");
    });
  });

  const PORT = 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});