// Load environment variables
const config = {
    // Face Recognition API URL
    FACE_AGENT_API_URL: process.env.NEXT_PUBLIC_FACE_RECOG_URL,

    // NestJS Server API URL
    NEST_SERVER_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

export default config;

// Export individual configs for easier access
export const { FACE_AGENT_API_URL, NEST_SERVER_API_URL } = config;
