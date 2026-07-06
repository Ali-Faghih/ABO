

# 🩸 ABO

<p align="center">
  <b>A Mobile-First Blood Donation Platform</b><br>
  Connecting blood donors with hospitals through a simple, fast and reliable experience.
</p>

---

## ✨ Overview

ABO is a mobile-first application designed to simplify the blood donation process by connecting blood donors with hospitals and healthcare centers.

The platform enables hospitals to publish blood requests while allowing donors to discover nearby requests, schedule appointments, and communicate directly with medical centers.

### 🧩 Problem Statement

In many regions, blood donation systems are fragmented, slow, and lack real-time coordination between donors and hospitals. ABO was designed to solve this by providing a unified digital platform where hospitals can instantly publish needs and donors can respond in real time with minimal friction.

---

# 📱 Application Preview

## 🌐 Live Demo

> The project is currently available in development mode.

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

---

## Welcome

![Welcome](./docs/mockups/welcome.png)

---

## Login

![Login](./docs/mockups/login.png)

---

## Home (Donor)

![Home](./docs/mockups/home-donor.png)

---

## Home (Hospital)

![Hospital](./docs/mockups/home-hospital.png)

---

## Blood Request Details

![Details](./docs/mockups/request-details.png)

---

## Appointment Booking

![Appointment](./docs/mockups/appointment.png)

---

## Chat

![Chat](./docs/mockups/chat.png)

---

## Profile

![Profile](./docs/mockups/profile.png)

---

## Magazine

![Magazine](./docs/mockups/magazine.png)

---

# 🚀 Features

* 🔐 Authentication (Donor / Hospital registration & login)
* 👤 Role-based Access (Donor / Hospital dashboards)
* 🩸 Blood Request Management (create, browse, match)
* 📍 City-based Request Discovery
* 📅 Appointment Booking & Management
* 💬 Donor–Hospital Real-time Messaging
* 📖 Educational Magazine (articles & health tips)
* 👨🏻‍⚕️ Health Profile Management (eligibility, readiness)
* 🔔 Smart Notifications
* 🏛️ National Registry Integration (donors & hospitals)
* 🗃️ Persistent Backend Database (Express + SQLite)

---

# 🏗 Tech Stack

| Technology               | Description            |
| ------------------------ | ---------------------- |
| ⚛️ React                 | Front-end Framework    |
| 🟦 TypeScript            | Type Safety            |
| ⚡ Vite                   | Build Tool             |
| 🎨 Tailwind CSS          | Styling                |
| 🖥️ Express              | Backend API Server     |
| 🗄️ sql.js (SQLite WASM) | Database Engine        |
| 🔁 concurrently          | Dev Mode Orchestration |

---

# 📂 Project Structure

```text
src/
├── app/
│   ├── components/
│   ├── contexts/
│   ├── data/
│   ├── screens/
│   ├── services/
│   └── types/
├── backend/
│   ├── routes/
│   ├── db.ts
│   ├── seed.ts
│   └── server.ts
├── assets/
├── styles/
└── main.tsx
```

---

# ⚙️ Getting Started

## Install dependencies

```bash
npm install
```

## Run development server (frontend + backend)

```bash
npm run dev:all
```

## Run backend only

```bash
npm run server
```

## Run frontend only

```bash
npm run dev
```

## Build production

```bash
npm run build
```

---

# 🗄️ Backend API

The Express backend runs on port `3001` and exposes the following API modules under `/api/`:

| Module           | Routes                                        | Description                          |
| ---------------- | --------------------------------------------- | ------------------------------------ |
| `/api/auth`      | login, register, logout, session, user lookup | Authentication & account management  |
| `/api/donors`    | profile CRUD, notifications                   | Donor-specific operations            |
| `/api/hospitals` | profile CRUD, listing toggle                  | Hospital-specific operations         |
| `/api/requests`  | blood requests, appointments                  | Request & appointment lifecycle      |
| `/api/chats`     | conversations, messages                       | Messaging between donors & hospitals |
| `/api/magazine`  | articles, categories                          | Educational content                  |
| `/api/registry`  | national donor & hospital registry            | Government registry integration      |

---


# 👥 User Roles

## 🩸 Donor

* Register with national ID
* Manage health profile & eligibility
* Browse blood requests by city
* Toggle donation readiness
* Book appointments
* Chat with hospitals
* Receive notifications

---

## 🏥 Hospital

* Register with hospital license
* Create & manage blood requests
* Review suitable donors
* Manage appointments
* Communicate with donors
* Toggle public listing

---

# 🗺 Roadmap

* ✅ Authentication
* ✅ Role-based UI
* ✅ Blood Requests
* ✅ Appointment Flow
* ✅ Database Integration (Express + SQLite)
* ✅ Magazine & Article System
* ✅ National Registry Management
* ✅ Notifications System
* ⏳ Real-time Chat (WebSocket)
* ⏳ Smart Donor Matching (AI/ML)
* ⏳ Deployment & CI/CD

