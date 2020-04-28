#!/bin/bash
docker rm -f e2e-test-postgres
docker run -d --name e2e-test-postgres -p 5554:5432 \
    -e POSTGRES_DB=e2e-test-postgres \
    -e POSTGRES_USER=e2e-test-postgres \
    -e POSTGRES_PASSWORD=e2e-test-postgres \
    mdillon/postgis:11-alpine \