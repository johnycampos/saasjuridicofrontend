import api from './api'

export const googleCalendarService = {
  getStatus() { return api.get('/google-calendar/status') },
  getConnectUrl() { return api.get('/google-calendar/connect') },
  disconnect() { return api.delete('/google-calendar/disconnect') },
  getEvents(timeMin, timeMax) {
    return api.get('/google-calendar/events', { params: { timeMin, timeMax } })
  },
  listCalendars() { return api.get('/google-calendar/calendars') },
  updateCalendar(calendarId) { return api.put('/google-calendar/calendar', { calendarId }) }
}
