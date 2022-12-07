DOCKER_IMAGE_NAME ?= cover-list

build_docker_img:
	docker build --tag ${DOCKER_IMAGE_NAME} .

install:
	npm install

lint:
ifndef IN_DOCKER
	docker run -it --rm -v ${CURDIR}:/apps ${DOCKER_IMAGE_NAME} make lint
else
	make install
	npm run lint
endif

build:
ifndef IN_DOCKER
	docker run -it --rm -v ${CURDIR}:/apps ${DOCKER_IMAGE_NAME} make build
else
	make install
	npm run build
endif

run:
	docker run -it --rm --name cover-list-httpd -p 8084:80 -v ${PWD}:/usr/local/apache2/htdocs/ httpd:2.4
