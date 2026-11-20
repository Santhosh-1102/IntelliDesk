import api from './api';

export const knowledgeService = {
  /**
   * Upload and ingest a document into the Knowledge Base
   * @param {FormData} formData - Contains 'file', 'title', and optional 'category'
   */
  uploadDocument: async (formData) => {
    const response = await api.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetch paginated list of ingested documents
   */
  getDocuments: async (page = 0, size = 10) => {
    const response = await api.get('/knowledge/documents', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get single document metadata by ID
   */
  getDocumentById: async (id) => {
    const response = await api.get(`/knowledge/documents/${id}`);
    return response.data;
  },

  /**
   * Get all chunk fragments of a document for inspection and auditing
   */
  getDocumentChunks: async (id) => {
    const response = await api.get(`/knowledge/documents/${id}/chunks`);
    return response.data;
  },

  /**
   * Toggle document active state (active documents are queried by RAG)
   */
  toggleDocumentActive: async (id) => {
    const response = await api.patch(`/knowledge/documents/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Permanently delete a document and its chunks
   */
  deleteDocument: async (id) => {
    const response = await api.delete(`/knowledge/documents/${id}`);
    return response.data;
  },

  /**
   * Real-time semantic & full-text RAG test search
   */
  searchChunks: async (query, topK = 3) => {
    const response = await api.post('/knowledge/search', {
      query,
      topK,
    });
    return response.data;
  },
};

export default knowledgeService;
