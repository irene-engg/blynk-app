import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();
const app = express();

// ✅ Make sure this matches your frontend ALB exactly
const VITE_CLIENT_URL = process.env.CLIENT_URL || "http://frontend-alb-1490243353.ca-central-1.elb.amazonaws.com";

const BACKEND_URL = process.env.BACKEND_URL || "http://internal-backend-alb-443620539.ca-central-1.elb.amazonaws.com:5000";

// ✅ CORS Setup for secure cross-origin cookie sharing
app.use(cors({
	origin: function(origin, callback) {
		// Allow requests with no origin (like mobile apps, curl requests)
		if(!origin) return callback(null, true);
		
		// List of allowed origins
		const allowedOrigins = [
			'http://frontend-alb-1490243353.ca-central-1.elb.amazonaws.com',
			'http://localhost:3000',
			'http://localhost:5173',
			'http://localhost'
		];
		
		if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			console.log('Blocked by CORS: ', origin);
			callback(null, true); // Temporarily allow all origins
		}
	},
	credentials: true
}));

// Add custom CORS headers for preflight requests
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.header('Access-Control-Allow-Credentials', 'true');
	
	// Handle preflight requests
	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}
	
	next();
});

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", orderRoutes);

// Serve frontend build if NODE_ENV=production (Optional)
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Launch the backend server
const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
	console.log(`Backend is running on http://localhost:${PORT}`);
	connectDB();
});
