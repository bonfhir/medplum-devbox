#!/bin/bash
 
MAX_ATTEMPTS=5
attempt_num=1
until /etc/init.d/postgresql start && psql -U postgres --command "CREATE USER medplum WITH PASSWORD 'medplum';" && psql -U postgres --command "CREATE DATABASE medplum WITH OWNER = medplum;" && psql -U postgres --command "\c medplum;\nCREATE EXTENSION \"uuid-ossp\";" || (( attempt_num == MAX_ATTEMPTS ))
do
    echo "Attempt $attempt_num failed! Trying again in $attempt_num seconds..."
    sleep $(( attempt_num++ ))
done