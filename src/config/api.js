export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
    // Authentication
    REGISTER: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/token`,
    GET_CURRENT_USER: `${API_BASE_URL}/users/me`,

    // Vocabulary
    GET_VOCABULARY: `${API_BASE_URL}/vocabulary`,
    ADD_VOCABULARY: `${API_BASE_URL}/vocabulary`,

    // Learning Cycle
    CREATE_CYCLE: `${API_BASE_URL}/cycles`,
    GET_CURRENT_CYCLE: `${API_BASE_URL}/cycles/current`,
    ADD_VOCAB_TO_CYCLE: `${API_BASE_URL}/cycles/vocabulary`,
    UPDATE_VOCAB_STATUS: (wordId) => `${API_BASE_URL}/cycles/vocabulary/${wordId}`,

    // Chat
    CHAT: `${API_BASE_URL}/chat`,
}; 