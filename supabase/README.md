# Votelyst Database Schema Documentation

## Overview

This document describes the database schema for the Votelyst polling application. The schema is designed to support user authentication, poll creation, option management, and vote tracking while maintaining data integrity and security.

## Tables

### 1. auth.users (Supabase Auth)

This is the built-in Supabase authentication table that stores user information.

- Used for user authentication and identification
- Referenced by other tables to associate data with specific users

### 2. polls

Stores information about individual polls created by users.

**Fields:**
- `id` (UUID, PK): Unique identifier for the poll
- `user_id` (UUID, FK): References auth.users(id), identifies the poll creator
- `question` (TEXT): The main poll question
- `description` (TEXT): Optional description of the poll
- `created_at` (TIMESTAMP): When the poll was created
- `updated_at` (TIMESTAMP): When the poll was last updated

### 3. poll_options

Stores the available options for each poll.

**Fields:**
- `id` (UUID, PK): Unique identifier for the option
- `poll_id` (UUID, FK): References polls(id), associates the option with a specific poll
- `option_text` (TEXT): The text of the option
- `created_at` (TIMESTAMP): When the option was created
- `updated_at` (TIMESTAMP): When the option was last updated

### 4. votes

Records votes cast by users for specific poll options.

**Fields:**
- `id` (UUID, PK): Unique identifier for the vote
- `poll_id` (UUID, FK): References polls(id), identifies which poll was voted on
- `option_id` (UUID, FK): References poll_options(id), identifies which option was selected
- `user_id` (UUID, FK): References auth.users(id), identifies who cast the vote
- `created_at` (TIMESTAMP): When the vote was cast
- Unique constraint on (poll_id, user_id) to prevent duplicate votes

## Relationships

1. **User to Polls**: One-to-many relationship. A user can create multiple polls.
   - Foreign key: polls.user_id → auth.users.id

2. **Poll to Options**: One-to-many relationship. A poll can have multiple options.
   - Foreign key: poll_options.poll_id → polls.id

3. **Poll to Votes**: One-to-many relationship. A poll can receive multiple votes.
   - Foreign key: votes.poll_id → polls.id

4. **Option to Votes**: One-to-many relationship. An option can receive multiple votes.
   - Foreign key: votes.option_id → poll_options.id

5. **User to Votes**: One-to-many relationship. A user can cast multiple votes (but only one per poll).
   - Foreign key: votes.user_id → auth.users.id
   - Constraint: Unique(poll_id, user_id) ensures one vote per user per poll

## Security Considerations

### Row-Level Security (RLS) Policies

The database uses Supabase Row-Level Security to control access to data:

#### Polls Table
- **Read**: Anyone can view all polls (public access)
- **Create**: Users can only create polls as themselves
- **Update/Delete**: Users can only modify or delete their own polls

#### Poll Options Table
- **Read**: Anyone can view all poll options
- **Create/Update/Delete**: Users can only modify options for polls they created

#### Votes Table
- **Read**: Anyone can view all votes (for results)
- **Create**: Authenticated users can cast votes as themselves
- **Update/Delete**: Users can only modify or delete their own votes

### Additional Security Features

1. **Cascading Deletes**: If a poll is deleted, all associated options and votes are automatically deleted
2. **UUID Primary Keys**: Using UUIDs instead of sequential IDs for better security
3. **Timestamps**: All tables track creation and update times for audit purposes
4. **Unique Constraint**: Prevents users from voting multiple times on the same poll

## Performance Considerations

The schema includes indexes on foreign key columns to improve query performance:

- `idx_polls_user_id`: Speeds up queries filtering polls by user
- `idx_poll_options_poll_id`: Speeds up queries retrieving options for a specific poll
- `idx_votes_poll_id`: Speeds up queries counting votes per poll
- `idx_votes_option_id`: Speeds up queries counting votes per option
- `idx_votes_user_id`: Speeds up queries checking if a user has voted

## Implementation Notes

1. The schema uses Supabase's built-in authentication system
2. Row-Level Security ensures data integrity and privacy
3. The schema supports the core functionality of creating polls, adding options, and casting votes
4. The unique constraint on votes prevents duplicate voting