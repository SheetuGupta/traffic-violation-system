# Traffic Violation Management System

A comprehensive full-stack application designed to manage, report, and track traffic violations efficiently. The system provides role-based interfaces for administrators, traffic officers, and everyday users to interact with traffic violation data seamlessly.

## Project Structure

This is a monorepo containing both the frontend and backend components of the project.

*   **`/traffic-violation-api`**: The Spring Boot backend service. Contains the REST APIs, database interactions, and business logic.
*   **`/traffic-violation-api/frontend`**: The React frontend application. Contains the user interfaces, dashboards, and client-side routing.

*Note: You can find dedicated `README.md` files inside the respective `traffic-violation-api` and `frontend` directories with more specific setup instructions.*

## Key Features

*   **User Authentication**: Secure login and registration using Google OAuth verification and token-based UUIDs.
*   **Role-Based Access Control**: Different dashboards and permissions for Users, Officers, and Administrators.
*   **Violation Reporting**: Users can report traffic violations by providing details, location, and supporting evidence.
*   **Admin Dashboard**: A centralized hub for administrators to view real-time metrics, search vehicle history, manage officers, and oversee all reported violations.
*   **Real-time Map Integration**: Visual representation of violation hotspots and locations.
*   **Responsive UI**: A modern, clean, and responsive user interface built with React and Tailwind CSS.

## Tech Stack Overview

### Frontend
*   **React**: Core frontend library.
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **React Router**: For client-side navigation.

### Backend
*   **Java 17**: Core programming language.
*   **Spring Boot 3.2**: Framework for building the REST APIs.
*   **Spring Data JPA**: For database object-relational mapping.
*   **PostgreSQL**: Primary relational database for persistent storage.
*   **Lombok**: To reduce Java boilerplate.

## Getting Started

To run the complete project locally, you will need to set up both the backend and frontend separately.

### 1. Database Setup
Ensure you have a PostgreSQL instance running and create a database for the project. Update the connection settings in the backend's `application.properties`.

### 2. Run the Backend
Navigate to the backend directory and start the Spring Boot application:
```bash
cd traffic-violation-api
mvn clean install
mvn spring-boot:run
```

### 3. Run the Frontend
Open a new terminal, navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd traffic-violation-api/frontend
npm install
npm start
```


