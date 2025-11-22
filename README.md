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
- **AI Summary:** Integration with n8n and Google Gemini for AI post summarization.  
- **User Authentication:** Secure login and profile management.  
- **Admin System:** Monitor system and manage reports.  
- **Real-time Chat:** WebSocket-based messaging system.  

## **🛠 Tech Stack**

| Component | Technology |
| ----- | ----- |
| **Frontend** | React / Next.js |
| **Backend** | Node.js / Express |
| **Database** | Microsoft SQL Server |
| **Workflow Automation** | n8n + Google Gemini AI |
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
- MacOS/Linux
```bash
cp .env.example .env
```
- Windows
```bash
copy .env.example .env
```
2. **Get password app for gmail** 
   - Go to your Google Account settings.
   - Navigate to **Security**.
   - Under "Signing in to Google," select **2-Step Verification** and follow the instructions to turn it on.
   - Go back to the Security page and select **App passwords**.
   - Select **Mail** as the app and **Other (Custom name)** as the device.
   - Enter a name (e.g., "Kupantip") and click **Generate**.
   - Copy the 16-character password and use it for `SMTP_PASS` in your `.env` file.

3. ⚠️ **Note:** Ensure database credentials in `.env` match those in `compose.yml`.

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
| **mailer**   | SMTP_USER                | example@gmail.com |
|              | SMTP_PASS            | password |
| **n8n**      | N8N_HOST                 | [http://localhost:5678](http://localhost:5678)|
| **Frontend** | NEXTAUTH_SECRET          | SECRET_KEY |
|              | NEXTAUTH_URL             | [http://localhost](http://localhost)|
|              | BACKEND_URL              | [http://backend:8000/api/v1](http://backend:8000/api/v1)|
|              | NEXT_PUBLIC_BACKEND_HOST | [http://localhost:8000/api/v1](http://localhost:8000/api/v1)|



### **Installation & Running**

You can run the project in : **Fully Dockerized**

#### **Full Docker (Recommended)**

Run the entire stack (Db, Backend, Frontend, n8n) in containers.
```sh
docker compose up -d --build
```

#### **n8n Workflow Setup**

After the containers are running, you need to configure n8n for AI summarization features:

1. **Import the workflow** (one-time setup):
   ```bash
   docker exec kupantip-n8n n8n import:workflow --input=/home/node/workflows/ai-summary-workflow.json
   ```

2. **Configure Google Gemini API:**
   - Generate **Google Gemini API** from https://aistudio.google.com/app/api-keys
   - Open n8n at http://localhost:5678
   - Go to **Credentials** settings
   - Create a new **Google Gemini(PaLM) Api** credential
   - Add your Gemini API key

3. **Activate the workflow:**
   - Open the imported "AI Post Summary" workflow
   - Connect the Google Gemini Chat Model node to your credential
   - Click "Activate" to enable the workflow

4. **Test the AI summary feature:**
   ```bash
   GET http://localhost:8000/api/v1/n8n/post/:post_id
   ```

> 📖 **Detailed n8n setup guide:** See [n8n/workflows/README.md](n8n/workflows/README.md) for troubleshooting and advanced configuration.

## **📚 Resources**

* **Documentation:** [Google Doc Link](https://docs.google.com/document/d/1-2ALlc2GsVo7hijVkuJV1LBGhA6anqSawGLpEJQzIPU/edit?usp=sharing)  
* **Demo Videos:**  
  * [Iteration 1](https://youtu.be/Fp7zLkk3KoM)  
  * [Iteration 2](https://youtu.be/i49ESSFxvBE)  
  * [Iteration 3](https://youtu.be/YOvjb6aMCSg)
  * [Iteration 4](https://youtu.be/Vjn3ohDk0OU)
  * [Iteration 5](https://youtu.be/DHXBX4fWi0A)
    
* **Video presentation:** 
  * [Video for Software Demonstration](https://youtu.be/BIQ5QRSTGPQ?si=SRKy3f1EpfbxrDSL)
  * [Video for Software Development](https://youtu.be/BEBIV-jrzAQ?si=QO98chq0NkJL-SJO)

## **👥 Contributors**

  * [Xeei](https://github.com/Xeei)
  * [BossPattadon](https://github.com/BossPattadon)
  * [ParanyuLion](https://github.com/ParanyuLion)
  * [MunyinSam](https://github.com/MunyinSam)
