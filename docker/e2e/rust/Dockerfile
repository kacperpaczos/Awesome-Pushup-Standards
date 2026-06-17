FROM node:20-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates git \
  && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.83.0 \
  && . "$HOME/.cargo/env" \
  && rustup component add clippy rustfmt \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /work
