#!/bin/bash

# Docker Test Script for VMarket

# Colors for output
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Check if Docker is running
echo -e "${CYAN}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}Docker is running.${NC}"

# Build and start the containers
echo -e "${CYAN}Building and starting containers...${NC}"
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to build and start containers.${NC}"
    exit 1
fi

# Wait for services to be ready
echo -e "${CYAN}Waiting for services to be ready...${NC}"
sleep 10

# Check if containers are running
echo -e "${CYAN}Checking container status...${NC}"
containers=("vmarket-postgres" "vmarket-backend" "vmarket-frontend")

for container in "${containers[@]}"; do
    status=$(docker ps --filter "name=$container" --format "{{.Status}}")
    
    if [[ $status == *"Up"* ]]; then
        echo -e "${GREEN}$container is running.${NC}"
    else
        echo -e "${RED}$container is not running properly.${NC}"
        echo -e "${YELLOW}Checking logs for $container:${NC}"
        docker logs $container --tail 20
    fi
done

# Display access information
echo -e "\n${GREEN}VMarket is now running!${NC}"
echo -e "${CYAN}Frontend: http://localhost${NC}"
echo -e "${CYAN}Backend API: http://localhost:3001/api${NC}"
echo -e "\n${YELLOW}To stop the application, run: docker-compose down${NC}"