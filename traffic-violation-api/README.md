# Traffic Violation System - Backend API

This is the backend service for the Traffic Violation Management System. It provides the core APIs for managing user authentication, traffic violations, and database interactions.

## Technology Stack

* **Java 17**
* **Spring Boot 3.2.0**: For building the RESTful APIs.
* **Spring Data JPA**: For database interactions.
* **PostgreSQL**: Relational database for persistent storage.
* **Lombok**: To reduce boilerplate code (Getters, Setters, Constructors).

## Authentication

The authentication mechanism uses **token-based UUIDs** combined with Google OAuth verification. 

## Getting Started

### Prerequisites

* Java 17
* Maven
* PostgreSQL

### Setup and Run

1. Configure your PostgreSQL database settings in `src/main/resources/application.properties` (or `.yml`).
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The application will start on the configured port (default is 8080).
