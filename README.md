# ðŸ† C-O-D-E- TOURNAMENT Trading Utility

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Electron 35](https://img.shields.io/badge/Electron-35.2-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> A high-performance, cross-platform desktop application built with **Electron**, **React 19**, and **Tailwind CSS** for organizing competitive trading tournaments, bracket orchestration, participant leg tracking, and real-time risk utility modeling.

---

## ðŸ“¸ Application Showcase

| Tournament Creation & Overview | Dynamic Bracket System |
|:---:|:---:|
| ![Create Tournament](docs/screenshots/Screenshot%202026-01-08%20112513.png) | ![Round Bracket](docs/screenshots/Screenshot%202026-01-08%20112830.png) |

| Match Analysis & Leg Details | Matchup Execution |
|:---:|:---:|
| ![Analysis View](docs/screenshots/Screenshot%202026-01-08%20112928.png) | ![Matchup View](docs/screenshots/Screenshot%202026-01-08%20113008.png) |

| Stats & Metrics Dashboard | Leaderboard & Progression |
|:---:|:---:|
| ![Statistics](docs/screenshots/Screenshot%202026-01-08%20113047.png) | ![Progression](docs/screenshots/Screenshot%202026-01-08%20113130.png) |

| Tournament Management | Integrated Risk Modeling |
|:---:|:---:|
| ![Management](docs/screenshots/Screenshot%202026-01-08%20113444.png) | ![Risk Utility](docs/screenshots/Screenshot%202026-01-08%20113637.png) |

---

## âš¡ Key Features

- **ðŸŽ¯ Tournament Bracket Engine**: Intuitive single and multi-round elimination bracket management with dynamic matchup progression and real-time round advancing.
- **ðŸ“ˆ Trade Leg Tracking**: Record and analyze individual trading legs, profit/loss parameters, win-rate metrics, and competitor standings.
- **ðŸ›¡ï¸ Integrated Code Risk Utility**: Direct launcher for dedicated trade-risk evaluation, position sizing, and maximum drawdown constraints.
- **ðŸ“Š Real-Time Analytics & Stats**: Visual dashboards displaying participant performance, win streaks, and matchup histories.
- **ðŸ–¥ï¸ Native Desktop Experience**: Built on Electron with custom frameless window styling, rapid keyboard navigation, and seamless desktop integration.
- **âœ¨ Polished Aesthetic**: Styled with Tailwind CSS v4, Lucide React icons, and smooth micro-animations powered by Framer Motion.

---

## ðŸ—ï¸ Architecture & Project Structure

``
c-o-d-e-tournament/
â”œâ”€â”€ electron/                  # Electron main process & IPC handlers
â”‚   â””â”€â”€ main.js
â”œâ”€â”€ src/                       # React frontend source code
â”‚   â”œâ”€â”€ assets/                # Static assets & icons
â”‚   â”œâ”€â”€ components/            # Reusable UI components
â”‚   â”‚   â”œâ”€â”€ CodeRiskUtilityLauncher.jsx
â”‚   â”‚   â”œâ”€â”€ Layout.jsx
â”‚   â”‚   â”œâ”€â”€ LegCard.jsx
â”‚   â”‚   â”œâ”€â”€ ProtectedRoute.jsx
â”‚   â”‚   â”œâ”€â”€ RoundBracket.jsx
â”‚   â”‚   â”œâ”€â”€ TournamentCard.jsx
â”‚   â”‚   â””â”€â”€ TournamentStats.jsx
â”‚   â”œâ”€â”€ context/               # Global state (TournamentContext, UserContext)
â”‚   â”œâ”€â”€ pages/                 # Route views (Home, Analysis, Create, Login, Tournament)
â”‚   â”œâ”€â”€ utils/                 # Formatters, team generators, and helpers
â”‚   â”œâ”€â”€ App.jsx
â”‚   â””â”€â”€ main.jsx
â”œâ”€â”€ code-risk-utility/         # Standalone risk calculation utility
â”œâ”€â”€ docs/screenshots/          # UI screenshots & showcase assets
â”œâ”€â”€ public/                    # Application icons & public assets
â””â”€â”€ package.json
``

---

## ðŸš€ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- 
pm or yarn

### Installation

1. **Clone the repository:**
   `ash
   git clone https://github.com/c-odenat/c-o-d-e-tournament.git
   cd c-o-d-e-tournament
   `

2. **Install dependencies:**
   `ash
   npm install
   `

### Running the Application

- **Web Development Mode** (runs Vite in browser):
  `ash
  npm run dev
  `

- **Electron Desktop Development Mode** (runs Vite + Electron concurrently):
  `ash
  npm run electron:dev
  `

### Packaging & Building

Build production binaries for your target operating system:

`ash
# Build portable Windows executable
npm run electron:build:win

# Build macOS DMG
npm run electron:build:mac

# Build Linux AppImage
npm run electron:build:linux
`

Output installers will be saved to the elease/ directory.

---

## ðŸ› ï¸ Tech Stack

- **Core Runtime**: [Electron 35](https://www.electronjs.org/)
- **Frontend Framework**: [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/)
- **Bundler & Tooling**: [Vite](https://vite.dev/) with Rolldown compiler
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Motion & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Packaging**: [Electron Builder](https://www.electron.build/)

---

## ðŸ‘¤ Author

**Nathaniel Darko**
- GitHub: [@c-odenat](https://github.com/c-odenat)
- Portfolio: [Nathaniel Darko Portfolio](https://c-odenat.github.io)

---

## ðŸ“„ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
