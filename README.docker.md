# VMarket Docker Setup

This document provides instructions for running the VMarket application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system
- Docker Desktop (for Windows/Mac users)

## Getting Started

### 1. Build and Start the Containers

#### Using the Test Script (Recommended)

We've provided test scripts to help you build, start, and verify the containers:

**For Windows:**

```powershell
.\docker-test.ps1
```

**For Linux/Mac:**

```bash
./docker-test.sh
```

#### Manual Start

Alternatively, you can manually start the containers from the root directory of the project:

```bash
docker-compose up -d --build
```

This command will:

- Build the Docker images for the frontend and backend
- Start the PostgreSQL database
- Run database migrations
- Start the backend API server
- Start the frontend web server

### 2. Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:3001/api

### 3. Stop the Containers

To stop all running containers:

```bash
docker-compose down
```

To stop and remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

## Container Information

### PostgreSQL

- **Container Name**: vmarket-postgres
- **Port**: 5432
- **Username**: vmarket_user
- **Password**: vmarket_password
- **Database**: vmarket_db

### Backend

- **Container Name**: vmarket-backend
- **Port**: 3001
- **Environment**: Production

### Frontend

- **Container Name**: vmarket-frontend
- **Port**: 80

## Data Persistence

The PostgreSQL data is persisted using a Docker volume named `postgres_data`. This ensures that your data remains intact even if the containers are stopped or removed.

## Troubleshooting

### View Container Logs

To view logs for a specific container:

```bash
docker logs vmarket-backend
```

To follow logs in real-time:

```bash
docker logs -f vmarket-backend
```

### Access Container Shell

To access a shell inside a container:

```bash
docker exec -it vmarket-backend sh
```

### Database Connection Issues

If the backend cannot connect to the database, ensure that:

1. The PostgreSQL container is running: `docker ps | grep postgres`
2. The database credentials in `.env.docker` match those in `docker-compose.yml`

## Security Notes

- For production deployment, change the default database password and JWT secret
- Consider using Docker secrets or environment variables from a secure source
- Review and adjust the CORS settings in the backend as needed
