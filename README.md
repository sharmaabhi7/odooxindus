# Odooxindus

This is a full-stack project consisting of an Express/Prisma backend and a React/Vite frontend. It is a multi-tenant inventory management system. 

## Project Structure

- `coreinventory-backend`: Node.js Express API using Prisma ORM with PostgreSQL.
- `frontend`: React.js frontend built with Vite and Tailwind CSS.

---

## Prerequisites

Make sure you have the following installed on your machine:
- Node.js (v18 or higher recommended)
- PostgreSQL (Make sure the postgres service is running)

---

## Backend Setup & Database Initialization

1. **Navigate to the backend directory**
   ```bash
   cd coreinventory-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the environment**
   - Copy the example `.env` file to create your local `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open the new `.env` file and update the `DATABASE_URL` with your local PostgreSQL credentials and desired database name (e.g., `postgresql://username:password@localhost:5432/coreinventory?schema=public`).
   - *Note: Ensure your PostgreSQL database matching the name in the DATABASE_URL actually exists, or create it using your preferred SQL client.*

4. **Initialize the Database**
   - Run Prisma migrations to set up the database schema:
     ```bash
     npm run migrate
     ```
   - Seed the database with initial data:
     ```bash
     npm run db:seed
     ```

5. **Start the backend development server**
   ```bash
   npm run dev
   ```
   The backend should now be running on `http://localhost:5000`.

---

## Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the environment**
   - Copy the example `.env` file to create your local `.env`:
     ```bash
     cp .env.example .env
     ```
   - The default URL is `VITE_API_URL=http://localhost:5000/api/v1`, which corresponds to your local backend server.

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The frontend should now be running (usually on `http://localhost:5173`).

---

## Available Scripts

### Backend (`coreinventory-backend`)
- `npm run dev`: Starts the server with Nodemon for development.
- `npm run start`: Starts the application in production mode.
- `npm run migrate`: Creates/applies migrations and updates your database schema.
- `npm run studio`: Opens Prisma Studio to view and edit your database records visually.
- `npm run db:seed`: Seeds the database.

### Frontend (`frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the production bundle.
- `npm run lint`: Runs ESLint.
