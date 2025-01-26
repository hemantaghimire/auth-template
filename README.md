# Authentication Service Template

A production-ready authentication service built with Node.js, TypeScript, and Prisma, featuring JWT-based authentication and OAuth integration.

## Features

1. JWT Authentication
2. Email verification
3. Password reset functionality
4. OAuth (Google, GitHub) integration
5. Refresh token rotation
6. TypeScript support
7. Prisma ORM with PostgreSQL

## Prerequisites

- Node.js (v14+)
- PostgreSQL
- npm/yarn
- Redis (optional, for rate limiting)

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```