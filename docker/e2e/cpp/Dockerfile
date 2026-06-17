FROM node:20-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    clang-tidy clang-format cppcheck cmake g++ clazy \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /work
