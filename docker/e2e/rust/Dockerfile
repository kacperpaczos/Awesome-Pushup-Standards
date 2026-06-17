FROM node:20-bookworm

ENV CARGO_HOME=/usr/local/cargo
ENV RUSTUP_HOME=/usr/local/rustup
ENV PATH="/usr/local/cargo/bin:${PATH}"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates git \
  && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.83.0 \
  && rustup component add clippy rustfmt \
  && chmod -R a+rx /usr/local/cargo /usr/local/rustup \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /work
