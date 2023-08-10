FROM medplum/medplum-server:2.0.30

# Install OS dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends supervisor postgresql-15 redis\
    && rm -rf /var/lib/apt/lists/*

# Configure Postgres
RUN echo "listen_addresses = '*'" >> /etc/postgresql/15/main/postgresql.conf
RUN echo "local all all trust" > /etc/postgresql/15/main/pg_hba.conf
RUN echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/15/main/pg_hba.conf
RUN /etc/init.d/postgresql start && \
    psql -U postgres --command "CREATE USER medplum WITH PASSWORD 'medplum';" && \
    psql -U postgres --command "CREATE DATABASE medplum WITH OWNER = medplum;" && \
    psql -U postgres --command "\c medplum;\nCREATE EXTENSION \"uuid-ossp\";"

# Patch seed with client app
COPY ./medplum/seed.js packages/server/dist/seed.js

# Copy medplum config
COPY ./medplum/medplum.config.json /usr/src/medplum/packages/server/medplum.config.json

# Copy app
COPY ./app/dist packages/app/dist

RUN npm install -g http-server

# Entrypoint script
ADD ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
