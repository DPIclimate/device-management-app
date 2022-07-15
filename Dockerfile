FROM ubuntu:latest
WORKDIR /app
COPY . /app
RUN apt-get update