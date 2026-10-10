# 🏗️ Kal Sayegh — Construction Management & Project Estimation ERP Portal

![UI Architecture Banner](./assets/banner.svg)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind_CSS" />
  <img src="https://img.shields.io/badge/Ant_Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Gantt_Schedules-F59E0B?style=for-the-badge&logo=git&logoColor=white" alt="Gantt Schedules" />
  <img src="https://img.shields.io/badge/Turbopack-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Turbopack" />
</p>

---

## 📌 Executive Overview

**Kal Sayegh Dashboard** is an enterprise-grade web application tailored for general contractors, site engineers, and project estimators. Engineered with **Next.js 15 (Turbopack, App Router)**, the portal orchestrates end-to-end commercial construction workflows—from interactive **Gantt project scheduling** and **blueprint/site map uploads** to **multi-tier line-item cost estimation**, **client contract authoring**, markup calculations, and milestone-based invoice billing.

---

## 🚀 Key Engineering & Domain Capabilities

- **Interactive Gantt Timelines**: Powered by `@svar-ui/react-gantt` for visual milestone scheduling, dependency tracking, critical path estimation, and phase adjustments.
- **Line-Item Cost Estimation Engine**: Granular project breakdown structure supporting labor, materials, subcontractor fees, profit markup, contingency, and tax calculations.
- **Contract & Proposal Management**: Author client contracts, configure deposit percentages, specify payment terms, and capture digital client approvals.
- **Site Maps & Visual Blueprint Attachments**: Multi-file blueprint uploads with side-map reference previews for site supervisors.
- **Automated Invoicing & Milestone Billing**: Converts approved estimates into itemized progress billings, tracking paid deposits, balance dues, and payment fee waivers.
- **Next.js 15 App Router Architecture**: Clean route grouping with `(auth)`, `(dashboard)/admin`, dynamic route segments (`[id]`), and server/client boundary optimization via Turbopack.
- **Global State & Real-Time Sync**: Normalized RTK Query API caching layer combined with Socket.io client for real-time team collaboration and messaging.

---

## 🏛️ Application Architecture & Route Tree

```plaintext
kal-sayegh_dashboard/
├── assets/
│   └── banner.svg                     # High-resolution architectural banner
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Sign-in, onboarding & credential validation
│   │   ├── (dashboard)/
│   │   │   └── admin/
│   │   │       ├── dashboard/         # Project overview metrics & KPI cards
│   │   │       ├── estimate/          # Add/edit estimate, line-item calculator, upload
│   │   │       ├── invoice/           # Milestone invoicing & billing status
│   │   │       ├── estimator-management/ # Estimator staff roster & assignment
│   │   │       ├── employee-management/  # Site workers & team management
│   │   │       ├── items/             # Standard material & service cost catalog
│   │   │       ├── calendar/          # Site visit schedules & contractor agenda
│   │   │       └── settings/          # System configuration & tax/markup defaults
│   │   ├── layout.tsx                 # Root layout with Redux & Theme providers
│   │   └── globals.css                # Tailwind CSS design system rules
│   ├── components/
│   │   ├── dashboard/Admin/           # Modular domain UI components (Estimates, Gantt)
│   │   ├── modal/                     # Contract modals, client selection dialogs
│   │   ├── table/                     # Dynamic line-item calculation tables
│   │   └── ui/                        # Reusable form primitives, toggle switches
│   └── redux/                         # Redux Toolkit store, RTK Query API endpoints
├── package.json                       # Next.js 15.5.9, React 18, @svar-ui/react-gantt
└── tsconfig.json
```

---

## 💻 Tech Stack Specification

| Layer | Technologies |
|---|---|
| **Framework** | **Next.js 15.5.9** (App Router, Turbopack, Server/Client Components) |
| **UI Library** | React 18, Ant Design, Lucide Icons, Sonner |
| **Styling** | Tailwind CSS 3.4, PostCSS, Custom Theme Variables |
| **Visual Scheduling** | `@svar-ui/react-gantt`, `@unicef/react-org-chart`, Recharts |
| **State Management** | Redux Toolkit (RTK), RTK Query API Slices |
| **Real-Time Client** | Socket.io Client |
| **Type System** | TypeScript 5 (Strict Mode) |

---

## 🛠️ Getting Started & Local Development

### Prerequisites
* **Node.js**: `v20.x` or higher
* **Package Manager**: `npm`, `yarn`, or `pnpm`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shahjalal-labs/kal-sayegh_dashboard.git
cd kal-sayegh_dashboard
npm install
```

### 2. Configure Environment Variables
Create a local `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Server (Turbopack)
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 👨‍💻 Engineering & Authorship

Developed and engineered by **Md. Shahjalal**.

* **GitHub**: [@shahjalal-labs](https://github.com/shahjalal-labs)
* **Email**: [muhommodshahjalal@gmail.com](mailto:muhommodshahjalal@gmail.com)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
