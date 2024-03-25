# loudwater

An interactive GUI for managing, querying, and sharing any postgres database

## Getting started

This guide will take you through the steps necessary to get up and running with Loudwater.

### Before you begin

To use Loudwater you need the following installed in your system: [Git](https://git-scm.com/downloads) and Docker ([Windows](https://docs.docker.com/desktop/install/windows-install/), [MacOS](https://docs.docker.com/desktop/install/mac-install/), or [Linux](https://docs.docker.com/desktop/install/linux-install/)).

### 1. Get the code

Run the following command in your CLI to clone the Loudwater repository:

```
git clone https://github.com/bruinenxyz/loudwater.git
```

### 2. Copy default env variables

Enter the Loudwater root directory:

```
cd loudwater
```

Run the following commands to copy the default environment variables:

```
cp ./backend/.env.example ./backend/.env
cp ./frontend/.env.example ./frontend/.env
```

### 3. Build & run

There are two ways to "build" your Loudwater deployment. You can either use our pre-built Docker images or build locally on your machine.

#### Use pre-built Docker images

Run the following command in the Loudwater root directory to pull the required images from our Loudwater Docker Hub repositories ([frontend](https://hub.docker.com/repository/docker/bruinenco/loudwater-frontend/general) & [backend](https://hub.docker.com/repository/docker/bruinenco/loudwater-backend/general)) and run your local deployment of Loudwater:

```
docker compose up -d
```

#### Build locally

Run the following command in the Loudwater root directory to build and run your local deployment of Loudwater:

```
docker compose -f docker-compose.build.yml up --build -d
```

### 4. Start using Loudwater

Once your Docker containers are up and running, visit http://localhost:8000 in your browser to start using Loudwater.

#### Connect your first database

To connect your first database, hover over the "Select a database" dropdown in the navigation bar and select the "Add database" option.

Name your database, provide the Postges connection URL, and optionally specify the database schema before clicking "Connect Database".

Your database should now be available in the "Select a database" dropdown menu.
