# KU Pantip

A full-stack web application, likely a forum or discussion platform, built with a modern technology stack.

## Tech Stack

  * **Frontend:** [TypeScript](https://www.google.com/search?q=https.www.typescriptlang.org/), [Node.js](https://nodejs.org/) (based on `npm run dev` command)
  * **Backend:** [TypeScript](https://www.google.com/search?q=https.www.typescriptlang.org/)
  * **Database:** [TSQL](https://en.wikipedia.org/wiki/Transact-SQL) (e.g., Microsoft SQL Server)
  * **Workflow Automation:** [n8n](https://n8n.io/)
  * **Containerization:** [Docker](https://www.docker.com/)

## Project Structure

The repository is organized into the following main directories:

  * `/frontend`: Contains the client-side application code.
  * `/backend`: Contains the server-side application logic and API.
  * `/n8n`: Holds configuration or custom nodes for the n8n workflow automation.
  * `compose.yml`: The Docker Compose file for orchestrating the application services.

## Getting Started

Follow these instructions to get a local copy of the project up and running for development.

### Prerequisites

  * [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
  * [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/get-npm) (for local frontend development)

### Installation & Running

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/kupantip/kupantip.git
    cd kupantip
    ```

2.  **Set up environment variables:**
    Create a `.env` file from the example.

    ```sh
    cp .env.example .env
    ```

    *You will need to edit the `.env` file and add your specific configuration values (e.g., database credentials, API keys).*

3.  **Build and start the backend and database:**
    This command will build the Docker images and start the `db` and `backend` services in detached mode.

    ```sh
    docker compose up -d --build db backend
    ```

4.  **Start the frontend:**
    In a separate terminal, navigate to the `frontend` directory, install dependencies, and start the development server.

    ```sh
    cd frontend
    npm install
    npm run dev
    ```

The frontend application should now be running, typically at `http://localhost:3000` or a similar address.

## Resources

  * **Project Document:** [View Google Doc](https://docs.google.com/document/d/1-2ALlc2GsVo7hijVkuJV1LBGhA6anqSawGLpEJQzIPU/edit?usp=sharing)
  * **YouTube Demos:**
      * [Iteration 1](https://youtu.be/Fp7zLkk3KoM)
      * [Iteration 2](https://youtu.be/i49ESSFxvBE)
      * [Iteration 3](https://youtu.be/YOvjb6aMCSg)

## Contributors

  * [Xeei](https://github.com/Xeei)
  * [BossPattadon](https://github.com/BossPattadon)
  * [ParanyuLion](https://github.com/ParanyuLion)
  * [MunyinSam](https://github.com/MunyinSam)
