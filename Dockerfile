FROM medplum/medplum-server:2.0.18

# Install OS dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends supervisor \
    && rm -rf /var/lib/apt/lists/*

# Patch seed with client app
COPY ./medplum/seed.js packages/server/dist/seed.js

# Copy app
COPY ./app/dist packages/app/dist

RUN npm install -g http-server

# Entrypoint script
ADD ./medplum/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
