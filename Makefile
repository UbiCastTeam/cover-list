DOCKER_NODE ?= node:latest
DOCKER_RUN ?= docker run \
	--name cover-list-builder \
	--workdir /apps \
	--mount type=bind,src=${PWD},dst=/apps \
	--user "$(shell id -u):$(shell id -g)" \
	--rm -it

lint:
	${DOCKER_RUN} ${DOCKER_NODE} make lint_local

lint_local:
	npm install
	npm run lint

build:
	${DOCKER_RUN} ${DOCKER_NODE} make build_local

build_local:
	npm install
	npm run build

run:
	@echo 'Files are served at "http://127.0.0.1:8084".'
	docker run -it --rm --name cover-list-httpd -p 8084:80 -v ${PWD}:/usr/local/apache2/htdocs/ httpd:latest
