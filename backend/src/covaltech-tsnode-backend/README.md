# CovalTech TSNode Backend

## Overview

The **CovalTech TSNode Backend** is a TypeScript-based backend project designed to provide robust and modular functionalities for various applications. It includes utilities for logging, notifications, and shared helpers.

## Project Structure

The project is organized into the following main directories:

- **`const/`**: Contains constants used throughout the project, such as environment definitions.
- **`core/`**: Core functionalities, including configuration management and environment variable handling.
- **`modules/`**: Modular components for specific functionalities like logging, notifications, and utilities.
- **`types/`**: TypeScript type definitions for shared configurations and other components.

### Key Modules

#### 1. **Constants (`const/`)**

- Defines environment-related constants (`NodeEnv`).

#### 2. **Core (`core/`)**

- **`config.ts`**: Manages shared library configuration.
- **`env.ts`**: Handles environment variable loading and validation.
- **`init.ts`**: Initializes the shared library configuration.

#### 3. **Modules (`modules/`)**

- **`logger/`**: Provides a logging utility using the Winston library.
- **`notifier/`**: Handles notifications, including Telegram integration.
- **`db/`**: Manages database connections and generates configurations for `pgtyped`.
- **`utils/`**: Includes utility functions for time and date operations.

#### 4. **Types (`types/`)**

- Defines TypeScript interfaces for configurations, such as `LoggerConfig`, `TelegramConfig`, and `SharedLibConfig`.

## Installation

1. Add and initialize Git submodules:
   ```bash
   git submodule add https://github.com/your-repo/juneo-tsnode-backend.git <path-to-submodule>
   git submodule update --init --recursive
   ```

## Usage

### Environment Variables

Ensure the following environment variables are set in your `.env` file:

- `NODE_ENV`: The environment (e.g., `development`, `production`).

### Key Functions

#### Logger

- Use the `getLogger` function to log messages at various levels (info, warn, error).

#### Notifications

- Use the `notifyTeam` function to send messages to a Telegram chat.

#### Database

- Database runtime and migration tooling are managed at application level in each project.

## Development

### Code Structure

- All files include JSDoc comments for better readability and maintainability.
- Modular design ensures reusability and separation of concerns.
