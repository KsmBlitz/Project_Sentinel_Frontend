import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

export const urlsService = {
  list() {
    return api.get('/urls').then(r => r.data)
  },

  create(payload) {
    return api.post('/urls', payload).then(r => r.data)
  },

  getStatus(id) {
    return api.get(`/urls/${id}/status`).then(r => r.data)
  },

  getStats(id, days = 7) {
    return api.get(`/urls/${id}/stats`, { params: { days } }).then(r => r.data)
  },

  getIncidents(id) {
    return api.get(`/urls/${id}/incidents`).then(r => r.data)
  },

  checkNow(id) {
    return api.post(`/urls/${id}/check`).then(r => r.data)
  },
}
