#!/usr/bin/env bash

cd ~/scrumpoker
docker compose down
git pull
docker compose build
docker compose up -d
docker compose ps

echo "All services up and running"
