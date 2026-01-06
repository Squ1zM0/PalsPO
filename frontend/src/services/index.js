import api from './api';

export const authService = {
  async register(email, password, alias) {
    const response = await api.post('/auth/register', { email, password, alias });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  }
};

export const profileService = {
  async getProfile() {
    const response = await api.get('/profiles');
    return response.data.profile;
  },

  async updateProfile(data) {
    const response = await api.put('/profiles', data);
    return response.data.profile;
  },

  async updatePreferences(filters) {
    const response = await api.put('/profiles/preferences', { discovery_filters: filters });
    return response.data.preferences;
  }
};

export const discoveryService = {
  async getFeed(limit = 10, offset = 0) {
    const response = await api.get(`/discovery/feed?limit=${limit}&offset=${offset}`);
    return response.data.profiles;
  },

  async getPendingRequests() {
    const response = await api.get('/discovery/requests');
    return response.data.requests;
  },

  async sendConnectionRequest(userId) {
    const response = await api.post(`/discovery/connect/${userId}`);
    return response.data;
  },

  async respondToRequest(requestId, action) {
    const response = await api.put(`/discovery/requests/${requestId}`, { action });
    return response.data;
  }
};

export const matchService = {
  async getMatches() {
    const response = await api.get('/matches');
    return response.data.matches;
  },

  async requestPenPal(matchId) {
    const response = await api.post(`/matches/${matchId}/request-penpal`);
    return response.data;
  },

  async confirmPenPal(matchId) {
    const response = await api.post(`/matches/${matchId}/confirm-penpal`);
    return response.data;
  },

  async endMatch(matchId) {
    const response = await api.post(`/matches/${matchId}/end`);
    return response.data;
  }
};

export const messageService = {
  async getMessages(matchId, limit = 50, before = null) {
    let url = `/messages/${matchId}?limit=${limit}`;
    if (before) url += `&before=${before}`;
    const response = await api.get(url);
    return response.data.messages;
  },

  async sendMessage(matchId, content) {
    const response = await api.post(`/messages/${matchId}`, { content });
    return response.data.data;
  }
};

export const addressService = {
  async saveAddress(address) {
    const response = await api.put('/addresses', { address });
    return response.data;
  },

  async getMyAddress() {
    const response = await api.get('/addresses/me');
    return response.data;
  },

  async requestReveal(matchId) {
    const response = await api.post(`/addresses/reveal/${matchId}/request`);
    return response.data;
  },

  async confirmReveal(matchId) {
    const response = await api.post(`/addresses/reveal/${matchId}/confirm`);
    return response.data;
  },

  async getPartnerAddress(matchId) {
    const response = await api.get(`/addresses/partner/${matchId}`);
    return response.data.address;
  }
};

export const letterService = {
  async createEvent(matchId, eventType) {
    const response = await api.post(`/letters/${matchId}`, { event_type: eventType });
    return response.data.event;
  },

  async getEvents(matchId) {
    const response = await api.get(`/letters/${matchId}`);
    return response.data.events;
  },

  async updateEvent(eventId, eventType) {
    const response = await api.put(`/letters/${eventId}`, { event_type: eventType });
    return response.data.event;
  }
};

export const scanService = {
  async uploadScan(file, letterEventId) {
    const formData = new FormData();
    formData.append('scan', file);
    formData.append('letterEventId', letterEventId);
    
    const response = await api.post('/scans/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.scan;
  },

  async getScans(matchId) {
    const response = await api.get(`/scans/${matchId}`);
    return response.data.scans;
  },

  async getScanUrl(scanId) {
    const response = await api.get(`/scans/url/${scanId}`);
    return response.data.url;
  }
};

export const safetyService = {
  async blockUser(userId) {
    const response = await api.post(`/safety/block/${userId}`);
    return response.data;
  },

  async unblockUser(userId) {
    const response = await api.delete(`/safety/block/${userId}`);
    return response.data;
  },

  async getBlockedUsers() {
    const response = await api.get('/safety/blocked');
    return response.data.blocked;
  },

  async reportUser(userId, category, context) {
    const response = await api.post(`/safety/report/${userId}`, { category, context });
    return response.data;
  }
};
