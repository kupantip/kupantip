# **KU Pantip**

A brief description of what KU Pantip is (e.g., "A community forum for KU students," or "A feedback system for university services").

## **📖 Table of Contents**

- [About the Project](#-about-the-project)  
- [Tech Stack](#-tech-stack)  
- [Project Architecture](#-project-architecture)  
- [Getting Started](#-getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Environment Setup](#environment-setup)  
  - [Installation](#installation--running)    
- [Resources](#-resources)
- [Contributors](#-contributors)

## **🔭 About the Project**

**KU Pantip** University students often face problems in finding information about courses, professors, dormitories, campus life, or events in the university. Nowadays, students use many different apps to share and ask questions so the information is spread out and very hard to find.

### **Key Features**

- **Community Boards:** Posting and commenting.  
- **AI Summary:** Integration with n8n for ai summary tasks.  
- **User Authentication:** Secure login and profile management.  
- **Admin System**: Monitor system and manage report  

## **🛠 Tech Stack**

| Component | Technology |
| ----- | ----- |
| **Frontend** | React / Next.js |
| **Backend** | Node.js / Express |
| **Database** | MIcrosoft SQL Server |
| **Automation** | Github Action |
| **DevOps** | Docker, Docker Compose, Github Action |

## **🏗 Project Architecture**

The project is organized as a monorepo with the following structure:

```sh
kupantip/  
├── backend/        # Server-side application logic  
├── frontend/       # Client-side application  
├── n8n/            # Workflow automation configurations  
├── compose.yml     # Docker composition for orchestration  
└── README.md       # This documentation
```

## **🚀 Getting Started**

### **Prerequisites**

Ensure you have the following installed on your local machine:

* [Docker Desktop](https://www.docker.com/products/docker-desktop)  
* [Node.js](https://nodejs.org/) (v22+) & npm

### **Environment Setup**

**Clone the repository**  
```bash
git clone https://github.com/kupantip/kupantip.git
cd kupantip
```

1. **Configure Environment Variables** Copy the example configuration file and update the values.  
```bash
cp .env.example .env
```


2. ⚠️ **Note:** Ensure database credentials in `.env` match those in `compose.yml`.

| **Section**  | **Variable**             | **Value**                                                                                                                                             |
| ------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database** | SQL_USER                 | sa                                                                                                                                                    |
|              | SQL_SERVER               | db                                                                                                                                                    |
|              | SQL_PASSWORD             | Kup@ntip123!                                                                                                                                          |
|              | SQL_NAME                 | pantip_db                                                                                                                                             |
|              | SQL_PORT                 | 1433                                                                                                                                                  |
| **Auth**     | JWT_SECRET               | "jesusloveme"                                                                                                                                         |
|              | JWT_EXPIRES_IN           | "7d"                                                                                                                                                  |
|              | PORT                     | 8000                                                                                                                                                  |
|              | ADMIN_EMAIL              | admin@admin.com |
|              | ADMIN_PASSWORD           | Admin@1234 |
|              | ADMIN_HANDLE             | Admin |
| **Prisma**   | DATABASE_URL             | `"sqlserver://${SQL_SERVER}:${SQL_PORT};database=${SQL_NAME};user={${SQL_USER}};password={${SQL_PASSWORD}};encrypt=true;trustServerCertificate=true"` |
| **Frontend** | NEXTAUTH_SECRET          | SECRET_KY                                                                                                                      |
|              | NEXTAUTH_URL             | [http://localhost](http://localhost)                                                                                                                  |
|              | BACKEND_URL              | [http://backend:8000/api/v1](http://backend:8000/api/v1)                                                                                              |
|              | NEXT_PUBLIC_BACKEND_HOST | [http://localhost:8000/api/v1](http://localhost:8000/api/v1)                                                                                          |

### **Installation & Running**

You can run the project in : **Fully Dockerized**

#### **Full Docker (Recommended)**

Run the entire stack (Db, Backend, Frontend, n8n) in containers.
```sh
docker compose up -d --build
```

## **📚 Resources**

* **Documentation:** [Google Doc Link](https://docs.google.com/document/d/1-2ALlc2GsVo7hijVkuJV1LBGhA6anqSawGLpEJQzIPU/edit?usp=sharing)  
* **Demo Videos:**  
  * [Iteration 1](https://youtu.be/Fp7zLkk3KoM)  
  * [Iteration 2](https://youtu.be/i49ESSFxvBE)  
  * [Iteration 3](https://youtu.be/YOvjb6aMCSg)
  * [Iteration 4](https://youtu.be/Vjn3ohDk0OU)
  * [Iteration 5](https://youtu.be/DHXBX4fWi0A)


## **👥 Contributors**

  * [Xeei](https://github.com/Xeei)
  * [BossPattadon](https://github.com/BossPattadon)
  * [ParanyuLion](https://github.com/ParanyuLion)
  * [MunyinSam](https://github.com/MunyinSam)
