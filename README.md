# Medplum Devbox

A [Medplum](https://www.medplum.com/) docker image that you can use to run your local development against it.

Differences with the current (as of 2023-02-27) [official medplum docker image](https://hub.docker.com/r/medplum/medplum-server):
 - Runs **BOTH** the server **AND** the front-end app concurrently, along with postgresql and redis, so that once it's started you can [connect to the app](http://localhost:3000) right away
 - Automatically seeds a `ClientApplication` with default, stable [credentials](#default-application) in addition to the [default medplum user](#default-user)


**DO NOT USE IN PRODUCTION**.

This image exists to support local development workflows easily. The fact that it has a default application configured
means that you should never use this in production.
The database server is also not protected dequately.

## Get started

Run the following command to start the server:
```
docker run -p 8100:8100 -p 8103:8103 ghcr.io/bonfhir/medplum-devbox:latest
```

Once you see a message stating that the server has started, simply open a browser to http://localhost:8100.
Login with the `admin@example.com`/`medplum_admin`.

More elaborate example with a name, named volumes for data persistence, and starting detached:
```
docker run -p 8100:8100 -p 8103:8103 -v fhir_data:/var/lib/postgresql/15/main -v fhir_files:/usr/src/medplum/packages/server/dist/binary --name fhir_server --rm -d ghcr.io/bonfhir/medplum-devbox:latest
```

## Bring your own medplum config
To setup your own `medplum.config.json`, simply mount your config at `/usr/src/medplum/packages/server/medplum.config.json`.

## Ports

- `http://localhost:8100`: Medplum app
- `http://localhost:8103`: Medplum server

## Credentials

### Default user:

- **Username**: admin@example.com
- **Password**: medplum_admin

### Default application:

- **Client ID**: f54370de-eaf3-4d81-a17e-24860f667912
- **Client Secret**: 75d8e7d06bf9283926c51d5f461295ccf0b69128e983b6ecdd5a9c07506895de
- **Redirect URI**: http://localhost:3000/

> To customize the Redirect UI, you can use the `INITIAL_CLIENT_APP_REDIRECT_URI` environment variable during
> the initial container creation (during database init).

