# MiniStore Backend

REST API for the MiniStore e-commerce site. Built with **Node.js, Express and MongoDB (Mongoose)**.
The same server also serves the website from `../frontend`.

## Features
- Product CRUD: `GET`, `POST`, `PUT`, `DELETE`
- Search, category filter, price range, sorting and pagination
- Validation of every request, with clear error messages
- One consistent JSON format for success and errors
- Business rules: unique product titles (case-insensitive), safe regex search, whitelisted fields
- Secrets kept in `.env` (never committed)
- Frontend connected to the API, with an offline fallback to `frontend/data/products.json`

## Architecture
```
backend/
├── src/
│   ├── config/        env.js (settings), db.js (MongoDB connection)
│   ├── models/        Product schema + id counter (Mongoose)
│   ├── routes/        URL -> middleware -> controller
│   ├── middleware/    validation, request logger, 404 handler, error handler
│   ├── controllers/   take the validated request, call the service, send the response
│   ├── services/      business logic (queries, rules, duplicate check)
│   ├── utils/         AppError, asyncHandler
│   ├── seeds/         demo data + seed script
│   ├── app.js         builds the Express app
│   └── server.js      connects to the database, then starts listening
├── tests/             validator tests + API flow tests (no database needed)
├── .env.example       copy to .env
└── package.json
```
Request flow: **route -> validation middleware -> controller -> service -> model -> MongoDB**
Errors from any step go to the error handler, which sends one JSON format.

Why this split: each layer has one job, so validation, business rules and database code can change independently and be tested separately.

## Setup
Needs Node.js 18+ and MongoDB (local install, or a free MongoDB Atlas cluster).

1. Install packages
   ```
   cd backend
   npm install
   ```
2. Create your environment file and edit it
   ```
   cp .env.example .env        (Windows: copy .env.example .env)
   ```
   | Variable | Meaning |
   |---|---|
   | `PORT` | Server port (default 5000) |
   | `MONGO_URI` | MongoDB connection string (local or Atlas) |
   | `CORS_ORIGINS` | Extra browser origins allowed to call the API (comma separated) |

3. Load the demo products (this deletes existing products first)
   ```
   npm run seed
   ```
4. Start the server
   ```
   npm start          (or: npm run dev  to restart automatically on changes)
   ```
5. Open http://localhost:5000 (website) or http://localhost:5000/api/health (API).

Run the tests: `npm test`

Check that the frontend folder is complete (original CSS, cart.js, images, scripts wired to the API): `npm run check:frontend`

## Product model
| Field | Type | Rules |
|---|---|---|
| `id` | Number | created automatically (1, 2, 3...), unique; used in URLs like `/api/products/2` |
| `title` | String | required, 2-120 characters, unique (case-insensitive) |
| `price` | Number | required, greater than 0 |
| `description` | String | required, 10-1000 characters |
| `category` | String | required, 2-50 characters, saved in lowercase |
| `image` | String | optional, `http(s)` URL or `images/...` path (default placeholder) |
| `stock` | Number | optional, whole number 0 or more (default 0) |
| `rating` | `{ rate, count }` | optional, rate 0-5, count whole number (default 0, 0) |
| `createdAt`, `updatedAt` | Date | added automatically |

The numeric `id` comes from a small `counters` collection that adds 1 for every new product (the "sequence counter" pattern), so ids stay short and match the frontend's `product.html?id=2`. MongoDB's own `_id` and `__v` are hidden in API responses.

## API
Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/health` | Server and database check | 200 (503 if the database is down) |
| GET | `/products` | List products (filters below) | 200 |
| GET | `/products/categories` | List of categories | 200 |
| GET | `/products/:id` | One product | 200 |
| POST | `/products` | Create a product | 201 |
| PUT | `/products/:id` | Replace a product | 200 |
| DELETE | `/products/:id` | Delete a product | 200 |
| POST | `/cart/summary` | Cart total calculated on the server | 200 |

**Cart summary (prices are never taken from the browser)**
```
POST /api/cart/summary
{ "items": [ { "productId": 2, "quantity": 2 } ] }
```
The server looks up each product, uses the price from MongoDB (any `price` sent is ignored), merges duplicates, checks stock, and returns `{ items, itemCount, total }`. Unknown products or too little stock return `409`.

**Query parameters for `GET /products`**

| Parameter | Example | Meaning |
|---|---|---|
| `search` | `watch` | Matches title or category |
| `category` | `jewelry` | Exact category |
| `minPrice`, `maxPrice` | `500`, `2000` | Price range |
| `sort` | `low-high`, `high-low`, `newest`, `rating` | Order |
| `page`, `limit` | `1`, `10` | Pagination (limit max 100, default 10) |

**Create a product**
```
POST /api/products
Content-Type: application/json

{
  "title": "Leather Wallet",
  "price": 799,
  "description": "A slim leather wallet with six card slots.",
  "category": "accessories",
  "stock": 30
}
```
Response `201`:
```json
{ "success": true, "message": "Product created",
  "data": { "id": 16, "title": "Leather Wallet", "price": 799, "category": "accessories", "stock": 30, "image": "images/placeholder.svg", "rating": { "rate": 0, "count": 0 }, "createdAt": "...", "updatedAt": "..." } }
```

**List response**
```json
{ "success": true, "count": 10, "total": 15, "page": 1, "limit": 10, "pages": 2, "data": [ ... ] }
```

**Error format**
```json
{ "success": false, "error": "Validation failed",
  "errors": [ { "field": "price", "message": "Price must be a number greater than 0" } ] }
```
| Status | When |
|---|---|
| 400 | Invalid input, invalid id (must be a whole number), invalid JSON |
| 404 | Product or route not found |
| 409 | A product with that title already exists |
| 409 | ...also when a cart item is unknown or out of stock |
| 413 | Request body too large |
| 503 | MongoDB is not connected |
| 500 | Unexpected server error (details are logged, not sent) |

Notes: `PUT` replaces the product, so send all required fields; optional fields you leave out go back to their defaults.

**Try it with curl**
```
curl "http://localhost:5000/api/products?category=jewelry&sort=low-high"
curl -X POST http://localhost:5000/api/products -H "Content-Type: application/json" \
  -d '{"title":"Leather Wallet","price":799,"description":"A slim leather wallet.","category":"accessories"}'
curl -X PUT http://localhost:5000/api/products/<id> -H "Content-Type: application/json" -d '{ ...all required fields... }'
curl -X DELETE http://localhost:5000/api/products/<id>
```

## Security and design decisions
- **Secrets**: `.env` is in `.gitignore`; only `.env.example` is committed. The app stops with a clear message if `MONGO_URI` is missing.
- **Mass assignment**: validators copy only known fields into `req.validated`, so extra fields (like `_id`) in a request are ignored.
- **Search safety**: user text is escaped before being used in a regular expression.
- **Image URLs**: only `http(s)://` or `images/...` are accepted (blocks `javascript:` links).
- **Duplicate titles**: checked in the service (friendly 409) and enforced by a unique index in MongoDB.
- **Body size**: JSON bodies are limited to 10 KB.
- **Cart**: stays in the browser's LocalStorage (as in the original project). `POST /api/cart/summary` shows how a checkout would get trusted totals from the server.
- **Database down**: the API answers `503` and `/api/health` reports `disconnected`; a failed connection at startup stops the server with a clear message.
- **Numeric ids**: keep the existing frontend (cart, details page, `?id=2` links) working without changes.
- **No authentication yet**: anyone can call POST/PUT/DELETE. Adding login (JWT) with an admin role would be the next step before going public.

## Frontend connection
- `frontend/js/config.js` holds `API_BASE` (default `"api"`, same server).
- Products, the details page, and search/category/sort all call the API.
- If the API is unreachable, the site falls back to `frontend/data/products.json` and then to built-in products, so the page never breaks.
- Frontend opened separately (Live Server, GitHub Pages)? Set `API_BASE` to the full backend URL and add that origin to `CORS_ORIGINS`.
