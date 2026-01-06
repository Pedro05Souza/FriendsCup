# 🏆 Friends Cup - Tournament Management System

A comprehensive tournament management system built with **NestJS** and **TypeScript** to track matches, championships, and player statistics. The goal of this is to preserve the tournament history created and disputed by me and my friends.

## 📋 Project Overview

Friends Cup is a backend API designed to manage and record the history of football matches, championships, and tournaments played among friends. The system tracks:

- **Players**: Individual player profiles with stats (attack, defense, intelligence, mentality)
- **Championships**: Tournament competitions with multiple matches
- **Matches**: Individual games with scores and results
- **Groups**: Championship group stage management
- **Statistics**: Goals scored, conceded, and performance metrics

## 🚀 Quick Start


### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application with Docker**
   ```bash
   docker-compose up
   ```

5. **Run database migrations**
   ```bash
   npm run migrate:dev
   ```

## 📦 Available Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:debug` | Start with debugging enabled |
| `npm run start:prod` | Start production server |

### Building

| Command | Description |
|---------|-------------|
| `npm run build` | Build the application for production |

### Database

| Command | Description |
|---------|-------------|
| `npm run migrate:dev` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run prisma:generate` | Generate Prisma client |

### Docker

| Command | Description |
|---------|-------------|
| `docker-compose up` | Start all services |
| `docker-compose up -d` | Start services in background |
| `docker-compose down` | Stop all services |
| `docker-compose logs backend` | View backend logs |


## Database Backups

This project provides automated commands to **create and restore PostgreSQL database dumps** directly from the Docker container, without temporary files or manual cleanup.

---

### Creating a Database Dump

The dump is streamed directly from the database container to the host machine.

#### Command
```bash
npm run db:dump
```

### Restoring Database Dump

#### Command
```bash
npm run db:restore
```

