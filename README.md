# VMarket Application

VMarket is a marketplace application that allows shopkeepers to manage their products and export requests.

## Project Structure

The project consists of two main components:

- **Frontend**: React application with TypeScript
- **Backend**: NestJS API with PostgreSQL database

## Running with Docker

The easiest way to run the application is using Docker. We've provided a complete Docker setup with Docker Compose.

### Prerequisites

- Docker and Docker Compose installed on your system
- Docker Desktop (for Windows/Mac users)

### Quick Start

1. Clone this repository
2. Run the test script:

   **For Windows:**

   ```powershell
   .\docker-test.ps1
   ```

   **For Linux/Mac:**

   ```bash
   ./docker-test.sh
   ```

3. Access the application at http://localhost

For more detailed instructions, see [Docker Setup Documentation](./README.docker.md).

## Development Setup

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env` and update the database connection string
   - Run migrations: `npx prisma migrate dev`

4. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Features

- User authentication (login/register)
- Product management (create, read, update, delete)
- Export request system between shopkeepers
- Responsive design

## Technologies

### Frontend

- React
- TypeScript
- Axios for API requests
- React Router for navigation

### Backend

- NestJS
- PostgreSQL with Prisma ORM
- JWT authentication
- Class-validator for request validation

### DevOps

- Docker and Docker Compose
- Nginx for serving the frontend
