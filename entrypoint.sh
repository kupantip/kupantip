#!/bin/bash
set -e


/opt/mssql/bin/sqlservr &


echo "Waiting for SQL Server to be available..."
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -C -Q "SELECT 1" > /dev/null 2>&1; do
  sleep 1
done


echo "Running initialization script..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -C -i /usr/src/app/init-db.sql -v DatabaseName="$SQL_NAME" SQL_USER="$SQL_USER" SQL_PASSWORD="$SQL_PASSWORD"

echo "Finished database setup."
wait
