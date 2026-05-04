# Registration/Token Bugs Fix Plan

**Backend:**
- [ ] Add checkRegistration controller/route
- [ ] Add getUserRegistrations API
- [ ] Fix ticket.controller verify
- [ ] Update Registration schema (status field)

**Frontend:**
- [ ] Update registration.api.js (new endpoints)
- [ ] Fix EventDetailsPage.jsx (useEffect check + conditional UI)
- [ ] Create MyRegistrations.jsx page
- [ ] Add Navbar link

**Test:**
- [ ] cd server && npm run dev
- [ ] cd client && npm run dev  
- [ ] Test register, refresh, history, verify token

Approve to start backend edits → test → frontend.

