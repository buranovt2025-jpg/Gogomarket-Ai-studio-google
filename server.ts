import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import db from "./src/db/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Seed Data if empty
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    console.log("Seeding database...");
    const insertUser = db.prepare("INSERT INTO users (id, username, email, avatar_url, is_verified) VALUES (?, ?, ?, ?, ?)");
    const insertListing = db.prepare("INSERT INTO listings (id, user_id, title, description, price, category, media_url, media_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    const insertStory = db.prepare("INSERT INTO stories (id, user_id, media_url) VALUES (?, ?, ?)");

    const users = [
      { id: 'u1', username: 'alex_tech', email: 'alex@example.com', avatar: 'https://picsum.photos/seed/alex/200/200', verified: 1 },
      { id: 'u2', username: 'maria_style', email: 'maria@example.com', avatar: 'https://picsum.photos/seed/maria/200/200', verified: 0 },
      { id: 'u3', username: 'john_deals', email: 'john@example.com', avatar: 'https://picsum.photos/seed/john/200/200', verified: 1 },
    ];

    users.forEach(u => insertUser.run(u.id, u.username, u.email, u.avatar, u.verified));

    const listings = [
      { id: 'l1', user_id: 'u1', title: 'iPhone 15 Pro Max', desc: 'Perfect condition, 256GB', price: 999, cat: 'Electronics', url: 'https://picsum.photos/seed/iphone/800/800', type: 'image' },
      { id: 'l2', user_id: 'u2', title: 'Vintage Leather Jacket', desc: 'Genuine leather, size M', price: 150, cat: 'Fashion', url: 'https://picsum.photos/seed/jacket/800/1200', type: 'image' },
      { id: 'l3', user_id: 'u3', title: 'Mechanical Keyboard', desc: 'RGB, Blue switches', price: 80, cat: 'Electronics', url: 'https://picsum.photos/seed/keyboard/800/800', type: 'image' },
      { id: 'l4', user_id: 'u1', title: 'Sony WH-1000XM5', desc: 'Noise cancelling headphones', price: 300, cat: 'Electronics', url: 'https://picsum.photos/seed/sony/800/800', type: 'image' },
      { id: 'l5', user_id: 'u2', title: 'Designer Handbag', desc: 'New collection', price: 500, cat: 'Fashion', url: 'https://picsum.photos/seed/bag/800/1200', type: 'image' },
      { id: 'l6', user_id: 'u3', title: 'Gaming Mouse', desc: 'Ultra light', price: 60, cat: 'Electronics', url: 'https://picsum.photos/seed/mouse/800/800', type: 'image' },
    ];

    listings.forEach(l => insertListing.run(l.id, l.user_id, l.title, l.desc, l.price, l.cat, l.url, l.type));

    const stories = [
      { id: 's1', user_id: 'u1', url: 'https://picsum.photos/seed/s1/400/700' },
      { id: 's2', user_id: 'u2', url: 'https://picsum.photos/seed/s2/400/700' },
      { id: 's3', user_id: 'u3', url: 'https://picsum.photos/seed/s3/400/700' },
    ];

    stories.forEach(s => insertStory.run(s.id, s.user_id, s.url));
    console.log("Database seeded!");
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Gogomarket API is running" });
  });

  app.get("/api/listings", (req, res) => {
    try {
      const listings = db.prepare("SELECT * FROM listings ORDER BY created_at DESC").all();
      res.json(listings);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.get("/api/listings/:id", (req, res) => {
    try {
      const listing = db.prepare(`
        SELECT listings.*, users.username, users.avatar_url, users.is_verified
        FROM listings
        JOIN users ON listings.user_id = users.id
        WHERE listings.id = ?
      `).get(req.params.id);
      if (!listing) return res.status(404).json({ error: "Listing not found" });
      res.json(listing);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  app.get("/api/stories", (req, res) => {
    try {
      const stories = db.prepare(`
        SELECT stories.*, users.username, users.avatar_url 
        FROM stories 
        JOIN users ON stories.user_id = users.id 
        ORDER BY stories.created_at DESC
      `).all();
      res.json(stories);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  app.get("/api/users", (req, res) => {
    try {
      const users = db.prepare("SELECT * FROM users").all();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/listings", (req, res) => {
    const { id, user_id, title, description, price, category, media_url, media_type } = req.body;
    const listingId = id || Math.random().toString(36).substr(2, 9);
    try {
      const stmt = db.prepare(`
        INSERT INTO listings (id, user_id, title, description, price, category, media_url, media_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(listingId, user_id, title, description, price, category, media_url, media_type);
      res.json({ success: true, id: listingId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  app.get("/api/messages/:roomId", (req, res) => {
    try {
      const messages = db.prepare("SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC").all(req.params.roomId);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", (req, res) => {
    const { room_id, sender_id, content } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO messages (room_id, sender_id, content) VALUES (?, ?, ?)");
      stmt.run(room_id, sender_id, content);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  app.post("/api/search", async (req, res) => {
    const { query } = req.body;
    try {
      const listings = db.prepare("SELECT * FROM listings").all() as any[];
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                text: `Given the user search query: "${query}", and this list of products: ${JSON.stringify(listings.map(l => ({ id: l.id, title: l.title, description: l.description, category: l.category })))}. Return a JSON array of product IDs that match the query best. Only return the array, nothing else.`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const matchedIds = JSON.parse(response.text);
      const results = listings.filter(l => matchedIds.includes(l.id));
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/listings/:id/like", (req, res) => {
    const { user_id } = req.body;
    const listing_id = req.params.id;
    try {
      const exists = db.prepare("SELECT * FROM likes WHERE user_id = ? AND listing_id = ?").get(user_id, listing_id);
      if (exists) {
        db.prepare("DELETE FROM likes WHERE user_id = ? AND listing_id = ?").run(user_id, listing_id);
        res.json({ liked: false });
      } else {
        db.prepare("INSERT INTO likes (user_id, listing_id) VALUES (?, ?)").run(user_id, listing_id);
        
        // Notify owner
        const listing = db.prepare("SELECT user_id FROM listings WHERE id = ?").get(listing_id) as { user_id: string };
        if (listing && listing.user_id !== user_id) {
          db.prepare("INSERT INTO notifications (user_id, type, from_user_id, listing_id) VALUES (?, ?, ?, ?)")
            .run(listing.user_id, 'like', user_id, listing_id);
        }
        
        res.json({ liked: true });
      }
    } catch (err) {
      res.status(500).json({ error: "Action failed" });
    }
  });

  app.get("/api/listings/:id/likes", (req, res) => {
    try {
      const count = db.prepare("SELECT COUNT(*) as count FROM likes WHERE listing_id = ?").get(req.params.id) as { count: number };
      res.json(count);
    } catch (err) {
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  app.post("/api/users/:id/follow", (req, res) => {
    const { follower_id } = req.body;
    const following_id = req.params.id;
    try {
      const exists = db.prepare("SELECT * FROM followers WHERE follower_id = ? AND following_id = ?").get(follower_id, following_id);
      if (exists) {
        db.prepare("DELETE FROM followers WHERE follower_id = ? AND following_id = ?").run(follower_id, following_id);
        res.json({ following: false });
      } else {
        db.prepare("INSERT INTO followers (follower_id, following_id) VALUES (?, ?)").run(follower_id, following_id);
        
        // Notify
        db.prepare("INSERT INTO notifications (user_id, type, from_user_id) VALUES (?, ?, ?)")
          .run(following_id, 'follow', follower_id);
          
        res.json({ following: true });
      }
    } catch (err) {
      res.status(500).json({ error: "Action failed" });
    }
  });

  app.get("/api/notifications/:userId", (req, res) => {
    try {
      const notifications = db.prepare(`
        SELECT notifications.*, users.username, users.avatar_url
        FROM notifications
        JOIN users ON notifications.from_user_id = users.id
        WHERE notifications.user_id = ?
        ORDER BY notifications.created_at DESC
        LIMIT 20
      `).all(req.params.userId);
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send_message", (data) => {
      // data: { roomId, message, senderId, timestamp }
      io.to(data.roomId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
