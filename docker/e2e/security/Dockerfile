FROM node:20-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
  && curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.21.2/gitleaks_8.21.2_linux_x64.tar.gz \
    | tar xz -C /usr/local/bin gitleaks \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /work
