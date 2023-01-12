FROM node:16-bullseye
LABEL org.opencontainers.image.authors="dev@ensagehealth.com"

ARG MEDPLUM_BRANCH=main

# Install OS dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends supervisor \
    && rm -rf /var/lib/apt/lists/*

# Clone source code and build
RUN cd / && git clone --depth 1 --branch $MEDPLUM_BRANCH https://github.com/medplum/medplum.git workspace
WORKDIR /workspace
ADD ./medplum/seed.ts.$MEDPLUM_BRANCH.patch /workspace/seed.ts.patch
RUN patch /workspace/packages/server/src/seed.ts /workspace/seed.ts.patch
RUN npm ci
RUN npm run build

# Entrypoint script
ADD ./medplum/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord"]
