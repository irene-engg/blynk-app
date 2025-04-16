/*import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.mode === "development" ? "http://localhost:5004/api" : "/api",
	withCredentials: true, 
});

export default axiosInstance;*/

import axios from "axios";

// Set up axios with backend ALB DNS for production and localhost for development
const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" 
		? "http://localhost:5004/api" 
		: "http://backend-alb-1080770143.ca-central-1.elb.amazonaws.com:5000/api", // ALB DNS with port for production
	withCredentials: true,
	timeout: 10000, // Add timeout to prevent long hanging requests
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
});

// Add a request interceptor to attach the auth token to all requests
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("authToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		console.error("Request error:", error);
		return Promise.reject(error);
	}
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
	response => response,
	error => {
		if (error.code === 'ECONNABORTED' || !error.response) {
			console.error('Network error - connection timed out or server unreachable');
			// You can add custom error handling here
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;

