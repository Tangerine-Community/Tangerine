# Docker Image CI Workflow

This project builds and pushes Docker images with the GitHub Actions workflow at [`.github/workflows/docker-image.yml`](../../.github/workflows/docker-image.yml).

## Trigger

The workflow runs on a `release` event for branch `main-v4`.

## What Gets Built

The workflow defines 3 jobs, each building one image from a Dockerfile in `docker-build-files/`.

`./Dockerfile-*` regex reference (relative to `docker-build-files/`):

- `./Dockerfile-server` -> image `tangerine/server`
- `./Dockerfile-server-ui` -> image `tangerine/server-ui`
- `./Dockerfile-apk` -> image `tangerine/apk-generator`

In repository paths, those files are:

- `docker-build-files/Dockerfile-server`
- `docker-build-files/Dockerfile-server-ui`
- `docker-build-files/Dockerfile-apk`

## Build And Push Flow

Each job follows this sequence:

1. Check out code.
2. Generate image metadata and tags with `docker/metadata-action`.
3. Set up QEMU for `amd64`.
4. Set up Docker Buildx.
5. Log in to Docker Hub using `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets.
6. Build image with `docker/build-push-action`.
7. Push image tags to Docker Hub.

## Tags

The workflow publishes:

- A semver tag from the release (`type=semver,pattern={{raw}}`)
- A `latest` tag for each image

Examples:

- `tangerine/server:<release-version>` and `tangerine/server:latest`
- `tangerine/server-ui:<release-version>` and `tangerine/server-ui:latest`
- `tangerine/apk-generator:<release-version>` and `tangerine/apk-generator:latest`

## Caching

- `build-server` and `build-server-ui` use GitHub Actions cache (`cache-from` and `cache-to` with `type=gha`).
- `build-apk-generator` is configured with `no-cache: true`.

## Notes

- The push/login guard checks `github.event_name != 'pull_request'`; since this workflow is release-triggered, pushes are expected for normal runs.
- `build-server` checks out `main-v4` explicitly.
- `build-server-ui` and `build-apk-generator` check out the current branch/ref from the event context.