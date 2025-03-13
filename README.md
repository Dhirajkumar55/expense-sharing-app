# Expense Sharing Application

A expense sharing application built with NestJS that helps groups track and split expenses among members.

## Features

- Create and manage groups
- Add expenses with different split types
- Track balances between group members
- Settle up expenses between members
- Real-time balance calculations
- Redis caching for improved performance

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Running the Application

1. Clone the repository:

```bash
git clone <repository-url>
cd expense-sharing-app
```

2. Start the application in development mode:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

The application will be available at `http://localhost:8080`.

For production deployment:

```bash
docker-compose up --build
```

## API Documentation

The API documentation is available at `http://localhost:8080/swagger` when the application is running.

### Core Concepts

#### Groups

- Groups are collections of users who share expenses
- Each group maintains its own balance sheet
- Users can be part of multiple groups

#### Expense Types

1. **EQUAL** - Amount is split equally among all members
2. **EXACT** - Each member pays an exact specified amount
3. **PERCENTAGE** - Amount is split based on specified percentages

### API Endpoints

#### User Management

- `POST /api/users` - Create a new user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details

#### Group Management

- `POST /api/groups` - Create a new group
- `GET /api/groups` - List all groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/members` - Add members to a group

#### Expense Management

- `POST /api/expenses` - Create a new expense
  ```json
  {
    "description": "Dinner",
    "amount": 100.00,
    "type": "EQUAL",
    "paidById": "user-id",
    "groupId": "group-id",
    "splits": [
      {
        "userId": "user-id",
        "amount": 33.33  // Required for EXACT split
        "percentage": 33.33  // Required for PERCENTAGE split
      }
    ]
  }
  ```
- `GET /api/expenses/group/:groupId` - List group expenses

#### Settlement Management

- `POST /api/settlements` - Create a settlement
- `GET /api/settlements/group/:groupId` - Get group settlements
- `GET /api/settlements/detailed-balances/:groupId` - Get detailed balance sheet

### Example Workflow

1. Create users:

```bash
curl -X POST http://localhost:8080/api/users -H "Content-Type: application/json" -d '{"name": "John", "email": "john@example.com"}'
```

2. Create a group:

```bash
curl -X POST http://localhost:8080/api/groups -H "Content-Type: application/json" -d '{"name": "Trip to Paris", "description": "Expenses for Paris trip"}'
```

3. Add an expense:

```bash
curl -X POST http://localhost:8080/api/expenses -H "Content-Type: application/json" -d '{
  "description": "Hotel Booking",
  "amount": 300.00,
  "type": "EQUAL",
  "paidById": "user-id",
  "groupId": "group-id",
  "splits": [
    {"userId": "user1-id"},
    {"userId": "user2-id"},
    {"userId": "user3-id"}
  ]
}'
```

## Development

The development environment is set up with hot-reloading enabled. Any changes to the source code will automatically restart the application.

### Environment Variables

Key environment variables (all configured in docker-compose files):

- `DATABASE_HOST` - PostgreSQL host
- `DATABASE_PORT` - PostgreSQL port
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `DATABASE_NAME` - Database name
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port

## Architecture

- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **TypeORM** - ORM for database operations
- **Swagger** - API documentation

