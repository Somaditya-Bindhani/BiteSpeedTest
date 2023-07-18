# Gamma4 Backend

## Description

This is backend repo Bitespeed Backend Task Identity Reconciliation.

## Cloning

```bash
git clone https://github.com/Somaditya-Bindhani/BiteSpeedTest.git
cd BiteSpeedTest
```

## Installation

```bash
npm install
```
## Database Setup(for local)
For runnig the application locally please add a new file as .env in root folder and add a new variable as DATABASE_URL="your_postgres_db_url" , and run the following command to create the tables and generate the primsa client post installation . 

```bash
#to apply the migrations to db 
npx prisma migrate dev

```
```bash
#to generate a new primsa client 
npx prisma generate

```

## Run

```bash
#to start the node server via node
npm run start

#to start the server via nodemon
npm run start:dev
```

## Documentaion
Swagger documentation for APIs , Swagger Client can be used to trigger the identity api <br/>
URL : https://bit-speed-be-test.onrender.com/api-docs <br/>
Local : https://localhost:5050 <br/>
Development : https://bit-speed-be-test.onrender.com

## About me
Website : https://somaditya-bindhani.vercel.app/ <br/>
Resume  : https://drive.google.com/file/d/1fecS7k2Fv-jIyg5cGwsY9Srd__q4kJbD/view?usp=sharing <br/>

