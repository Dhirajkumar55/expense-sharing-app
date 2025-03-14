# Expense Sharing Application

A expense sharing application built with NestJS that helps groups track and split expenses among members.

## Features

- Create and manage groups
- Add expenses with different split types
- Track balances between group members
- Settle up expenses between members
- Real-time balance calculations
- Redis caching for improved performance

## Core Functionalities

### Expense Management

The application provides a robust expense management system with the following features:

1. **Adding Expenses**

   - Users can add expenses to any group they belong to
   - Each expense requires:
     - Description
     - Total amount
     - Who paid (paidById)
     - Split type (EQUAL, EXACT, or PERCENTAGE)
     - List of splits among group members

2. **Split Types**

   - **EQUAL Split**: Amount is divided equally among all participants
   - **EXACT Split**: Each participant pays a specific amount (sum must equal total)
   - **PERCENTAGE Split**: Each participant pays a percentage of the total (must sum to 100%)

3. **Validation Rules**
   - All participants must be members of the group
   - The same user cannot appear multiple times in splits
   - The payer must be a group member
   - For EXACT splits, the sum of split amounts must equal the total expense
   - For PERCENTAGE splits, percentages must sum to 100%

### Settlement System

The settlement system helps users resolve their debts efficiently:

1. **Balance Calculation**

   - The system maintains real-time balances for each user in a group
   - Balances are calculated by:
     - Adding the full amount to the payer's balance (positive = is owed money)
     - Subtracting split amounts from each participant's balance
     - Processing any settlements made between users

2. **Settlement Rules**

   - Users can only settle debts when:
     - The paying user (fromUser) has a negative balance (owes money)
     - The receiving user (toUser) has a positive balance (is owed money)
     - The settlement amount doesn't exceed the minimum of:
       - The absolute value of the paying user's negative balance
       - The receiving user's positive balance

3. **Detailed Balance Tracking**
   - For each user in a group, the system tracks:
     - Who they owe money to (owes)
     - Who owes them money (isOwed)
     - Their net balance in the group
   - All balances are cached for performance (1-minute TTL)

### Example: Adding an Expense

1. **Equal Split Example**:

```json
{
  "description": "Dinner",
  "amount": 100.0,
  "type": "EQUAL",
  "paidById": "user1-id",
  "groupId": "group1-id",
  "splits": [
    { "userId": "user1-id" },
    { "userId": "user2-id" },
    { "userId": "user3-id" }
  ]
}
```

Each user will owe $33.33 (except the payer who paid $100)

2. **Exact Split Example**:

```json
{
  "description": "Groceries",
  "amount": 100.0,
  "type": "EXACT",
  "paidById": "user1-id",
  "groupId": "group1-id",
  "splits": [
    { "userId": "user1-id", "amount": 20.0 },
    { "userId": "user2-id", "amount": 45.0 },
    { "userId": "user3-id", "amount": 35.0 }
  ]
}
```

3. **Percentage Split Example**:

```json
{
  "description": "House Rent",
  "amount": 1000.0,
  "type": "PERCENTAGE",
  "paidById": "user1-id",
  "groupId": "group1-id",
  "splits": [
    { "userId": "user1-id", "percentage": 40 },
    { "userId": "user2-id", "percentage": 35 },
    { "userId": "user3-id", "percentage": 25 }
  ]
}
```

### Example: Creating a Settlement

```json
{
  "amount": 50.0,
  "notes": "Settling dinner payment",
  "fromUserId": "user2-id",
  "toUserId": "user1-id",
  "groupId": "group1-id"
}
```

This will:

1. Increase user2's balance by $50 (they paid their debt)
2. Decrease user1's balance by $50 (they received the payment)
3. Update the detailed balance sheet automatically
4. Invalidate the group's balance cache for real-time accuracy

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
