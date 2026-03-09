"use client";

import axios from "axios";
import { getAegisEndpoint } from "./demoConfig";

export interface HealthStatus {
    status: "healthy" | "unhealthy" | "offline";
    modelsLoaded: boolean;
    message: string;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
    const endpoint = getAegisEndpoint();
    try {
        const response = await axios.get(`${endpoint}/health`, { timeout: 3000 });
        if (response.status === 200 && response.data.status === "healthy") {
            return {
                status: "healthy",
                modelsLoaded: response.data.models_loaded,
                message: response.data.message || "Risk engine online",
            };
        }
        return {
            status: "unhealthy",
            modelsLoaded: false,
            message: "Risk engine degraded",
        };
    } catch (error) {
        return {
            status: "offline",
            modelsLoaded: false,
            message: "Risk engine unreachable",
        };
    }
}
