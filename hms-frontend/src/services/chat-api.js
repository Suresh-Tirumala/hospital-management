import api from './api';

const AI_API_BASE = '/ai';

export const chatAPI = {
  createSession: (sessionType = 'GENERAL', title = 'New Chat') =>
    api.post(`${AI_API_BASE}/chat/sessions`, { sessionType, title }),

  sendMessage: (sessionId, content, context = null, includeRehabilitation = false) =>
    api.post(`${AI_API_BASE}/chat/sessions/${sessionId}/messages`, {
      content,
      context,
      includeRehabilitation
    }),

  getChatHistory: (sessionId, page = 0, size = 50) =>
    api.get(`${AI_API_BASE}/chat/sessions/${sessionId}/history`, {
      params: { page, size }
    }),

  getUserSessions: (page = 0, size = 20) =>
    api.get(`${AI_API_BASE}/chat/sessions`, {
      params: { page, size }
    }),

  endSession: (sessionId) =>
    api.patch(`${AI_API_BASE}/chat/sessions/${sessionId}/end`),

  deleteSession: (sessionId) =>
    api.delete(`${AI_API_BASE}/chat/sessions/${sessionId}`),

  getEducationalContent: (topic, detailLevel = 'intermediate', audience = 'general') =>
    api.post(`${AI_API_BASE}/educational`, { topic, detailLevel, audience }),

  getRehabilitationGuide: (condition, severity = 'moderate', focusArea = null) =>
    api.post(`${AI_API_BASE}/rehabilitation/guide`, { condition, severity, focusArea }),

  getRehabilitationCategories: () =>
    api.get(`${AI_API_BASE}/rehabilitation/categories`)
};

export default chatAPI;