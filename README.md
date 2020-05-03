# Evgeniy Khyst's Tech Blog

A simple tool built with Bash and Node.js converting GitHub repositories into a simple GitHub Pages blog.

## Prerequisites

1. Install [Node.js](https://nodejs.org/en/download/) 12.x
2. Install the `npm` dependencies
    ```bash
    npm i
    ```
3. Get [new GitHub personal access token](https://github.com/settings/tokens/new) and export it as `GITHUB_TOKEN` environment variable

## Building

1. Configure GitHub repositories to be converted to blog posts in `build.sh`
    ```bash
    projects=(geohash-example pairwise-comparison letsencrypt-docker-compose)
    ```
2. Build the static HTML pages
    ```bash
    ./build.sh
    ```