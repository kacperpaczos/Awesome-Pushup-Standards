cmake_minimum_required(VERSION 3.16)
project(cpp-qt-demo LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_CLANG_TIDY "clazy")

find_package(Qt6 REQUIRED COMPONENTS Widgets)

add_executable(cpp-qt-demo src/main.cpp)
target_link_libraries(cpp-qt-demo PRIVATE Qt6::Widgets)
