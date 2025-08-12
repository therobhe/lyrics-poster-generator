# Lyrics Poster Generator

A Vue.js application that allows users to generate beautiful posters from song lyrics.

## Features

- Search for songs and artists
- Display lyrics in visually appealing poster formats
- Customize poster designs
- View and save generated posters

## Technology Stack

- Vue.js 3
- JavaScript (ES6+)
- Vite for build tooling
- Node.js backend server

## Prerequisites

- Node.js (v16+ recommended)
- npm

## Project Setup

```bash
npm install
```


## Development
Install the dependencies
```bash
npm install
```
To start frontend and backend server simultaneously:
```bash
npm run dev:all
```
Start the backend server:
```bash
node server.js
```
Production Build
```bash
npm run build
```

## Project Structure
- src/ — Vue application source code 
  - components/ — Vue components
    - Header.vue — Application header
    - HomePage.vue — Main landing page
    - LyricsPoster.vue — Poster generation component with search interface and preview
- server.js — Backend server implementation