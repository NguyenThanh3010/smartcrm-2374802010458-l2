# Deployment Guide

## 1. Requirements

The project requires the following software and resources:

- Docker Desktop with Docker Compose (Windows/macOS), or Docker Engine with the Docker Compose plugin (Linux).
- Internet connection to download Docker images and install dependencies during the first build.
- TCP port `8080` available on the host machine.

Node.js and PostgreSQL do not need to be installed separately on the host because they run inside Docker containers.

## 2. Setup Steps

1. Clone the project repository and open a terminal in the project root directory.
2. Create the environment configuration file:

```bash
cp .env.example .env
```

3. Build and start the application:

```bash
docker compose up -d --build
```

4. Open the application in a web browser:

```text
http://localhost:8080
```

The frontend is served by Nginx. Nginx forwards API requests to the backend service inside the Docker network.

For a demonstration deployment, the default values in `.env.example` can be used. For any real deployment, replace the demonstration credentials and secret keys with unique values before starting the application.

## 3. Environment Variables

The following variables are required by the Docker Compose configuration:

| Variable | Description |
|---|---|
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `AUTH_USERNAME` | Initial administrator username |
| `AUTH_PASSWORD` | Initial administrator password used during account bootstrap |
| `AUTH_TOKEN_SECRET` | Secret key used to sign and verify authentication tokens. Use a secret of at least 32 bytes. |
| `DATA_ENCRYPTION_KEY` | Base64-encoded 32-byte key used for AES-256-GCM encryption |
| `PHONE_LOOKUP_KEY` | Base64-encoded 32-byte key used for HMAC-SHA256 phone lookup |

The following variables are also present in `.env.example` or the application configuration:

| Variable | Description |
|---|---|
| `DB_HOST` | Database host. Docker Compose overrides this with `postgres` for the container network. |
| `DB_PORT` | Database port. Docker Compose uses `5432`. |
| `APP_PORT` | Backend port. Docker Compose sets this to `3000` inside the container. |
| `VITE_API_BASE_URL` | Frontend API base path. The API client defaults to `/api` when this variable is not provided. The current Dockerfile does not pass this variable into the frontend build, so the default `/api` value is used in the Docker deployment. |
| `API_PROXY_TARGET` | Target address for the Vite development proxy. It defaults to `http://localhost:3000` and is only used when running the Vite development server. The Docker deployment uses Nginx to forward API requests to `backend:3000`. |

`NODE_ENV` is set to `production` by Docker Compose.

**Security notes:**

- Do not commit the `.env` file or publish its secret values.
- Replace demonstration passwords and secret keys before using the application outside a local demonstration environment.
- Keep `DATA_ENCRYPTION_KEY` and `PHONE_LOOKUP_KEY` unchanged after encrypting data. Losing or changing these keys without a proper migration can make existing encrypted data unusable.
- The initial administrator account is created during bootstrap. Changing `AUTH_PASSWORD` after that account already exists does not automatically change the existing account password.
- `VITE_API_BASE_URL`, when supplied during a frontend build, is included in the frontend bundle and must not contain secret information.

## 4. Sample Data

When the backend container starts, it automatically runs the following steps:

1. Apply database migrations.
2. Create the initial administrator account if it does not already exist.
3. Encrypt existing customer data when necessary.
4. Insert demonstration data.
5. Start the backend API.

On a fresh database, the sample data includes:

| Table | Expected records |
|---|---:|
| `app_user` | 1 |
| `customer` | 3 |
| `device` | 4 |
| `issue_category` | 6 |
| `service_center` | 2 |
| `ticket` | 3 |
| `ticket_status_log` | 1 |

The migration and seeding process is designed to be repeatable without inserting duplicate sample records.

## 5. Verify It Works

### 5.1 Check Docker services

Run:

```bash
docker compose ps
```

The `postgres`, `backend`, and `frontend` services should show a healthy status.

### 5.2 Check the application

Open the following address in a web browser:

```text
http://localhost:8080
```

The application login page should be displayed. Use the administrator credentials configured in `.env`.

### 5.3 Check the backend health endpoint

Run:

```bash
docker compose exec backend node -e "fetch('http://127.0.0.1:3000/health').then(r => { console.log('HTTP status:', r.status); process.exit(r.ok ? 0 : 1); }).catch(e => { console.error(e.message); process.exit(1); })"
```

The command should return HTTP status `200`.

### 5.4 Run automated tests

First, build the test image:

```bash
docker compose --profile test build test
```

Then run the automated tests:

```bash
docker compose --profile test run --rm test
```

The test profile starts a separate test database and executes migrations, administrator bootstrap, customer data encryption, sample data seeding, and all automated test suites.

The test database is separate from the application's main database.

The expected result is **29 automated tests passing**, including unit, integration, API, and cryptography tests.

### 5.5 Verify repeatability

Run the test command again without rebuilding the image:

```bash
docker compose --profile test run --rm test
```

The migrations and seeding process should complete without errors or duplicate records. Previously applied migrations should be skipped, and existing sample records should not be inserted again.

### 5.6 Stop the application

Run:

```bash
docker compose down
```

This stops the containers while keeping the named database volumes and stored data.

Do not use `docker compose down -v` unless you intentionally want to delete the database volumes and their data.