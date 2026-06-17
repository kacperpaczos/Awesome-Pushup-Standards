FROM node:20-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 python3-pip python3-venv \
  && pip3 install --break-system-packages \
    ruff mypy bandit pip-audit pytest pytest-cov \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /work
