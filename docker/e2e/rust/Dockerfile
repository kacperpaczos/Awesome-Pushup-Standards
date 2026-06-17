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

ARG CARGO_MODULES_VERSION=0.21.2
ARG CARGO_DENY_VERSION=0.18.9

RUN cargo install cargo-modules --version ${CARGO_MODULES_VERSION} --locked \
  && curl -sSfL "https://github.com/EmbarkStudios/cargo-deny/releases/download/${CARGO_DENY_VERSION}/cargo-deny-${CARGO_DENY_VERSION}-x86_64-unknown-linux-musl.tar.gz" \
    | tar xz --strip-components=1 -C /usr/local/bin \
      "cargo-deny-${CARGO_DENY_VERSION}-x86_64-unknown-linux-musl/cargo-deny" \
  && cargo modules --version \
  && cargo deny --version

RUN chmod -R a+rwX /usr/local/cargo

WORKDIR /work
