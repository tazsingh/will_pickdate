server:
	./http_server.ru -p 8000

guard:
	@bundle > /dev/null
	@bundle exec guard

.PHONY: server guard
