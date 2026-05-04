# EventFlow Admin Role Implementation - TODO

## Approved Plan Steps

### [x] Phase 1: Backend Foundation
- [x] Step 1: Update server/src/models/User.js (add 'admin' to enum)
- [x] Step 2: Update server/src/models/Event.js (add status: pending/approved/rejected)
- [x] Step 3: Update server/src/controllers/auth.controller.js (allow admin registration)
- [x] Step 4: Create server/src/controllers/admin.controller.js (getPendingEvents, approveEvent, rejectEvent, getUsers)

### [x] Phase 2: Admin Routes & Middleware
- [x] Step 5: Create server/src/routes/admin.routes.js
- [x] Step 6: Update server/src/app.js (mount /api/admin)
- [x] Step 7: Update client/src/api/event.api.js (getUpcoming filter approved)

### [ ] Phase 3: Frontend
- [ ] Step 8: client/src/pages/AdminDashboard.jsx (stats, pending list, approve buttons)
- [ ] Step 9: Update Navbar.jsx (admin links)
- [ ] Step 10: client/src/App.jsx (admin routes w/ ProtectedRoute roles=['admin'])

### [ ] Phase 4: Seed & Test
- [ ] Step 11: Update server/scripts/seed.js (add admin user)
- [ ] Step 12: Run cd server &amp;&amp; npm run seed
- [ ] Step 13: Test flow (login admin, approve event, check frontend)

**Current: Phase 1 Step 1**


