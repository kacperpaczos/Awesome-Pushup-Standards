cmake_minimum_required(VERSION 3.16)
project(demo LANGUAGES CXX)

find_package(Qt6 REQUIRED COMPONENTS Widgets)

set(CMAKE_CXX_CLANG_TIDY "clazy")

add_executable(demo main.cpp)
target_link_libraries(demo PRIVATE Qt6::Widgets)
