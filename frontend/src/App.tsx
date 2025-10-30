import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@routes/AppRoutes";
import { Header } from "@components/Header/Header";

function AppContent() {
	return (
		<div style={{ height: "100%", width: "100%", padding: 0, margin: 0 }}>
			<Header />
			<AppRoutes />
		</div>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	);
}