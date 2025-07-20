// Load environment variables
const config = {
    // Face Recognition API URL
    FACE_AGENT_API_URL:
        process.env.FACE_AGENT_API_URL ||
        process.env.NEXT_PUBLIC_FACE_AGENT_API_URL ||
        'http://localhost:8080',

    // NestJS Server API URL
    NEST_SERVER_API_URL:
        process.env.NEST_SERVER_API_URL ||
        process.env.NEXT_PUBLIC_NEST_SERVER_API_URL ||
        'http://localhost:3000',
};

export default config;

// Export individual configs for easier access
export const { FACE_AGENT_API_URL, NEST_SERVER_API_URL } = config;
