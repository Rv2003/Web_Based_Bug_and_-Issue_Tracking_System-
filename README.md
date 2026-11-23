# Pacemark

A web app for tracking bugs and tasks in a software team. It has a kanban board, a sprint dashboard, a team workload page and an admin page for managing users and roles.

React (Vite) frontend, Express API, MongoDB. Everything runs in Docker.

## Run it

You need Docker. From the project root:

```bash
docker compose up -d --build
docker compose exec backend npm run seed
```

The seed step adds demo users and tasks. Skip it and the database stays empty, so there is nobody to log in as.

Then open http://localhost:3000.

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| API      | http://localhost:5000  |
| MongoDB  | localhost:27017        |

Demo logins (all use `password123`):

- `admin@example.com` (admin)
- `priya@example.com` (admin)
- `amara@example.com` (manager)
- `kenji@example.com` (member)
- `hana@example.com` (viewer)

Stop it with `docker compose down`. Add `-v` to wipe the database too.

## Running without Docker

You need Node 20+ and a MongoDB running locally. `BACKEND/.env` holds the port, the Mongo URL and the JWT secret, so change the URL there if your Mongo runs somewhere else.

```bash
cd BACKEND
npm install
npm run seed
npm run dev
```

```bash
cd FRONTEND
npm install
npm run dev
```

## Jenkins pipeline

The `Jenkinsfile` runs on a Jenkins agent that has Docker. Each build:

1. builds the backend and frontend images
2. starts the stack with `docker compose up -d`
3. checks that the API (port 5000) and the frontend (port 3000) answer
4. pushes both images to Docker Hub
5. seeds the demo data

To set it up, make a pipeline job with "Pipeline script from SCM" that points at this repo and the `Jenkinsfile` path. The file runs on the agent labelled `rootless-user-agent`, so change that label to match your own agent. The push step needs a Jenkins username/password credential with the ID `dockerhub` (a Docker Hub username and an access token).

## Docker Hub images

The pipeline pushes two images, each tagged `latest` and with the Jenkins build number:

- `mudeera03/bugtracker-backend`
- `mudeera03/bugtracker-frontend`

MongoDB uses the official `mongo` image, so it isn't pushed.

## Layout

```
BACKEND/    Express API (models, routes, seed script)
FRONTEND/   React app
docker-compose.yml
Jenkinsfile                build, deploy, smoke test, push to docker hub, seed
.github/workflows/ci.yml   build + docker build on every push
```
