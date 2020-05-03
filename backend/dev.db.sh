#!/bin/bash
docker rm -f ktu-dev-db
docker run -d --name ktu-dev-db -p 5432:5432 \
    -e POSTGRES_DB=ktu-map \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=ktu1234 \
    mdillon/postgis:11-alpine \