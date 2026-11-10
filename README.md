
# Product REST API

A CRUD REST API built using Node.js and its native HTTP module.

## Features

- Retrieve all products
- Retrieve a product by ID
- Create a product
- Replace an existing product
- Partially update a product
- Delete a product
- JSON request and response handling
- Basic input validation
- HTTP error handling

## Technologies

- Node.js
- JavaScript
- HTTP
- REST API
- Postman

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /products | Get all products |
| GET | /products/:id | Get product by ID |
| POST | /products | Create product |
| PUT | /products/:id | Replace product |
| PATCH | /products/:id | Partially update product |
| DELETE | /products/:id | Delete product |

## Run locally

```bash
npm start
```

Server URL:

http://localhost:3000

## Current limitations

- Products are stored in memory.
- Data disappears when the server restarts.
- No authentication or authorization.
- No database integration.
