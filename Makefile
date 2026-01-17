# Variables
DOCKER_COMPOSE = docker-compose

.PHONY: help up down build logs restart clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make up       - Start the application (detached mode)"
	@echo "  make down     - Stop the application"
	@echo "  make build    - Build and start the application"
	@echo "  make logs     - View logs"
	@echo "  make restart  - Restart the application"
	@echo "  make clean    - Stop and remove containers, networks, and images"

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

build:
	$(DOCKER_COMPOSE) up --build -d

logs:
	$(DOCKER_COMPOSE) logs -f

restart: down up

clean:
	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans
