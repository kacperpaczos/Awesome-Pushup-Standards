FROM node:20-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
  && curl -sSfL https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Linux-x86_64 \
    -o /usr/local/bin/hadolint \
  && chmod +x /usr/local/bin/hadolint \
  && npm install -g @stoplight/spectral-cli@6.15.0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /work
