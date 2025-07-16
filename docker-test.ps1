# Docker Test Script for VMarket

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Cyan
try {
    docker info | Out-Null
    Write-Host "Docker is running." -ForegroundColor Green
}
catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Build and start the containers
Write-Host "Building and starting containers..." -ForegroundColor Cyan
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to build and start containers." -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check if containers are running
Write-Host "Checking container status..." -ForegroundColor Cyan
$containers = @("vmarket-postgres", "vmarket-backend", "vmarket-frontend")

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "{{.Status}}"
    
    if ($status -match "Up") {
        Write-Host "$container is running." -ForegroundColor Green
    }
    else {
        Write-Host "$container is not running properly." -ForegroundColor Red
        Write-Host "Checking logs for $container:" -ForegroundColor Yellow
        docker logs $container --tail 20
    }
}

# Display access information
Write-Host "
VMarket is now running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "
To stop the application, run: docker-compose down" -ForegroundColor Yellow