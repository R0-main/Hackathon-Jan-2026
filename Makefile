all: run

run: init build
	docker compose up -d

build: init
	docker compose build

down:
	docker compose down

restart: down run

logs:
	docker compose logs -f $(filter-out $@,$(MAKECMDGOALS))

clean: down
	docker compose down -v --rmi local

re: clean all

init:
	@test -f .env || cp .env.example .env

# SSL avec Let's Encrypt
ssl:
	docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d $(DOMAIN) --email $(EMAIL) --agree-tos --no-eff-email

# Dev local (sans Docker)
dev-back:
	cd backend && source .venv/bin/activate && uvicorn app.main:app --reload

dev-front:
	cd frontend && npm run dev

.PHONY: all run build down restart logs clean re init ssl dev-back dev-front
