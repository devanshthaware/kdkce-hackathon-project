import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: path.join(__dirname, ".."),
    webpack: (config) => {
        config.resolve.alias["@aegis/auth-sdk"] = path.resolve(
            __dirname,
            "../sdk/dist/index.js"
        );
        return config;
    },
};

export default nextConfig;
