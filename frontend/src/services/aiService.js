import api from './api';

export const aiService = {
  /**
   * Send a chat message to the IT troubleshooting assistant
   * @param {{ message: string, sessionId?: string, category?: string }} data
   */
  async sendMessage(data) {
    const response = await api.post('/ai/chat', data);
    return response.data;
  },

  /**
   * Submit diagnostic step feedback (worked vs failed)
   * @param {{ sessionId: string, stepNumber: number, worked: boolean, notes?: string }} data
   */
  async submitStepFeedback(data) {
    const response = await api.post('/ai/steps/feedback', data);
    return response.data;
  },

  /**
   * Escalate conversation to an official human IT ticket
   * @param {{ sessionId: string, reason?: string, userNotes?: string, department?: string }} data
   */
  async escalateSession(data) {
    const response = await api.post('/ai/escalate', data);
    return response.data;
  },

  /**
   * Fetch paginated past troubleshooting sessions for current user
   * @param {number} page
   * @param {number} size
   */
  async getUserSessions(page = 0, size = 10) {
    const response = await api.get(`/ai/sessions?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Get full details and message history of a specific session
   * @param {string} sessionId
   */
  async getSessionDetails(sessionId) {
    const response = await api.get(`/ai/sessions/${sessionId}`);
    return response.data;
  },
};
