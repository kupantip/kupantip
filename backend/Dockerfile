FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y curl gnupg apt-transport-https

# เพิ่ม Microsoft GPG key
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -

# เพิ่ม Microsoft repository (ตัวอย่างสำหรับ Debian 11/Bullseye)
# (ถ้า base image เป็น Ubuntu 22.04 ให้เปลี่ยน 11/prod.list เป็น 22.04/prod.list)
RUN curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list

# ติดตั้ง mssql-tools และ unixodbc
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev

WORKDIR /app

COPY package*.json .

COPY . .

RUN npm install

RUN npm run build

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://localhost:8000/health || exit 1

CMD [ "npm", "start" ]