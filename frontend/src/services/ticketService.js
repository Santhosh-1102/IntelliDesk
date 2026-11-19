import api from './api';

export const ticketService = {
  async createTicket(data) {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  async getMyTickets(page = 0, size = 10) {
    const response = await api.get(`/tickets/my?page=${page}&size=${size}`);
    return response.data;
  },

  async getAssignedTickets(page = 0, size = 10) {
    const response = await api.get(`/tickets/assigned?page=${page}&size=${size}`);
    return response.data;
  },

  async getAllTickets(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    query.append('page', params.page || 0);
    query.append('size', params.size || 10);
    const response = await api.get(`/tickets?${query.toString()}`);
    return response.data;
  },

  async getTicketByNumber(ticketNumber) {
    const response = await api.get(`/tickets/${ticketNumber}`);
    return response.data;
  },

  async updateTicketStatus(ticketId, data) {
    const response = await api.patch(`/tickets/${ticketId}/status`, data);
    return response.data;
  },

  async assignTicket(ticketId, data) {
    const response = await api.post(`/tickets/${ticketId}/assign`, data);
    return response.data;
  },

  async addComment(ticketId, data) {
    const response = await api.post(`/tickets/${ticketId}/comments`, data);
    return response.data;
  },

  async getComments(ticketId) {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data;
  },

  async getHistory(ticketId) {
    const response = await api.get(`/tickets/${ticketId}/history`);
    return response.data;
  },

  async submitFeedback(ticketId, data) {
    const response = await api.post(`/tickets/${ticketId}/feedback`, data);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },
};
