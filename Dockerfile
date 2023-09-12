ARG MEDPLUM_VERSION

FROM medplum/medplum-server:$MEDPLUM_VERSION

# Install OS dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends supervisor postgresql-15 redis\
    && rm -rf /var/lib/apt/lists/*

# Configure Postgres
RUN echo "listen_addresses = '*'" >> /etc/postgresql/15/main/postgresql.conf
RUN echo "local all all trust" > /etc/postgresql/15/main/pg_hba.conf
RUN echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/15/main/pg_hba.conf
COPY ./medplum/create-database.sh /usr/src/
RUN chmod +x /usr/src/create-database.sh && \
    /usr/src/create-database.sh && \
    rm /usr/src/create-database.sh

# Patch seed with client app
COPY ./medplum/seed.js packages/server/dist/seed.js

# Copy medplum config
COPY ./medplum/medplum.config.json /usr/src/medplum/packages/server/medplum.config.json

# Install app
RUN mkdir -p /usr/src/medplum/packages/app
RUN npm install --prefix /usr/src/medplum/packages/app @medplum/app@$MEDPLUM_VERSION
RUN find /usr/src/medplum/packages/app -type f -exec sed -i 's/__MEDPLUM_BASE_URL__/http:\/\/localhost:8103/g' {} \;
RUN find /usr/src/medplum/packages/app -type f -exec sed -i 's/__MEDPLUM_CLIENT_ID__//g' {} \;
RUN find /usr/src/medplum/packages/app -type f -exec sed -i 's/__GOOGLE_CLIENT_ID__//g' {} \;
RUN find /usr/src/medplum/packages/app -type f -exec sed -i 's/__RECAPTCHA_SITE_KEY__//g' {} \;
RUN find /usr/src/medplum/packages/app -type f -exec sed -i 's/__MEDPLUM_REGISTER_ENABLED__/true/g' {} \;
RUN npm install -g http-server

# Entrypoint script
ADD ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
