# Getting Started

* https://typeorm.io/
* https://nestjs.com

First install node modules:

```bash
npm install
```

Start postgres:

```bash
docker-compose up -d
```

# Buiding

Build & run the docker image with (this will also start postgres):

```bash
docker-compose up -d --build 
```

# Testing

Running unit tests:

```bash
jest
```

Hitting localhost http://localhost:3000/orders
