# 🏥 Kal Sayegh Clinic — Healthcare Administration & Telehealth Portal

![UI Architecture Banner](./assets/banner.svg)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind_CSS" />
  <img src="https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white" alt="Radix_UI" />
  <img src="https://img.shields.io/badge/Healthcare_UI-00F2FE?style=for-the-badge&logo=heart&logoColor=white" alt="Healthcare_UI" />
  
</p>

---

## 📌 Executive Overview

Kal Sayegh Dashboard provides clinical staff, doctors, and practice administrators with a centralized control plane for appointment scheduling, patient clinical records, doctor shift rosters, and telemedicine session management.

---

## 🚀 Key Frontend Engineering Highlights

- **Calendar & Scheduling**: Dynamic calendar views with doctor shift overlays and double-booking guards.
- **Accessible Component System**: Built on Radix UI and Headless UI primitives for 100% WCAG accessibility.
- **Electronic Health Records (EHR)**: Secure patient clinical history viewer with encrypted document attachments.
- **Telemedicine Console**: Integrated video consultation room launcher with live patient queuing.
- **Responsive Telemetry**: Real-time KPI analytics for clinic attendance, revenue, and doctor availability.

---

## 📂 Project Architecture

```plaintext
kal-sayegh_dashboard/
├── assets/
│   └── banner.svg         # UI architecture visual banner
├── src/
│   ├── components/        # Reusable design system primitives & UI atoms
│   ├── pages/ or app/     # Application routes & layouts
│   ├── hooks/             # Custom React hooks & state encapsulation
│   ├── services/          # API client endpoints & HTTP adapters
│   └── styles/            # Tailwind CSS configurations & themes
├── public/                # Static assets & icons
├── package.json
└── tsconfig.json
```

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **Package Manager**: npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shahjalal-labs/kal-sayegh_dashboard.git
cd kal-sayegh_dashboard
npm install
```

### 2. Environment Configuration
Create a local `.env` file if required:
```bash
cp .env.example .env 2>/dev/null || true
```

### 3. Run Development Server
```bash
npm run dev
```

Application will launch locally at `http://localhost:3000` or `http://localhost:5173`.

---

## 👨‍💻 Engineering & Authorship

Developed and maintained by **Md. Shahjalal**.

* **GitHub**: [@shahjalal-labs](https://github.com/shahjalal-labs)
* **Email**: [muhommodshahjalal@gmail.com](mailto:muhommodshahjalal@gmail.com)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
