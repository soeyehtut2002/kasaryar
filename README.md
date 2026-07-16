# KaSarYar - Game Top-up Web Application

Welcome to the repository for **KaSarYar**, a full-stack e-commerce platform designed for game top-ups (like Mobile Legends, PUBG, etc.). This project features a seamless customer checkout experience with local payment methods (KPay, WavePay, PromptPay) and an Admin Dashboard for verifying manual payment slips.

## 🚀 Overview

KaSarYar allows users to browse their favorite games, select top-up packages, enter their game User ID/Zone ID, and purchase using manual bank transfers. Customers upload their payment slips, which are then reviewed by the Admin. Once approved, the system integrates with the GalaxyLink API (B2B) to process the top-up automatically.

## 🛠️ Technologies Used

**Frontend (Client)**
- React (Vite)
- Tailwind CSS
- React Router DOM
- React i18next (Internationalization)
- Lucide React (Icons)

**Backend (Server)**
- Node.js & Express.js
- Prisma ORM
- PostgreSQL (Neon Database)
- Multer (For slip uploads)
- JWT (JSON Web Tokens for Admin Authentication)
- Node-Fetch (For external API requests)

## 📁 Project Structure

- `frontend/`: React application containing the user interface and admin dashboard.
  - `src/pages/`: Contains all main views (Home, GameDetail, AdminDashboard, UserDashboard).
  - `src/components/`: Reusable UI components.
  - `public/`: Static assets (e.g., QR codes).
- `backend/`: Express server handling business logic, database queries, and third-party APIs.
  - `src/controllers/`: Logic for shop, admin, auth, and uploads.
  - `src/routes/`: API endpoint definitions.
  - `prisma/`: Prisma schema configuration.
  - `uploads/`: Directory for storing customer payment slips.

## 💻 Getting Started (Local Development)

To run this project locally on your machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended).
- A PostgreSQL database (e.g., [Neon](https://neon.tech/)).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/soeyehtut2002/kasaryar.git
   cd kasaryar
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder and add your environment variables:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   PORT=5000
   JWT_SECRET="your_secret_key"
   NODE_ENV="development"
   GALAXYLINK_API_URL="https://api.galaxylink.gg"
   GALAXYLINK_CLIENT_ID="your_client_id"
   GALAXYLINK_API_KEY="your_api_key"
   ```
   Run Prisma migrations:
   ```bash
   npx prisma db push
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   ```
   Start the Vite development server:
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Visit `http://localhost:3000` to access the application.

## 🌐 API Integrations

This project integrates with the **GalaxyLink B2B API** to process game top-ups automatically after admin verification. You must have a valid GalaxyLink `brand_id` and API key for production use.

## 📬 Contact

- **Developer:** Soe Ye Htut
- **GitHub:** [soeyehtut2002](https://github.com/soeyehtut2002)
