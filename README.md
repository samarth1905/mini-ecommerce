# Mini E-commerce Store

A responsive mini e-commerce website built as an internship task using HTML5, CSS3, JavaScript, JSON and a public mock product API.

## Features

- Product listing with 15 products
- Product data loaded through the Fake Store API
- Local JSON fallback
- Search products by name
- Filter products by category
- Sort products by price
- Clear filters
- Product details page
- Add to cart
- Increase/decrease quantity
- Remove products
- Cart subtotal
- LocalStorage cart persistence
- Loading, error and empty states
- Responsive desktop, tablet and mobile layout

## Project Structure

```text
mini-ecommerce/
├── index.html
├── product.html
├── css/
│   └── style.css
├── js/
│   ├── products.js
│   ├── cart.js
│   └── product-details.js
├── data/
│   └── products.json
├── images/
└── README.md
```

## Technologies Used

- HTML5
- CSS3
- JavaScript
- JSON
- Fetch API
- LocalStorage
- Git/GitHub

## Product Data

The main product listing is loaded from the public Fake Store API using JavaScript `fetch()`.

If the API is unavailable, the application falls back to the 15 products in `data/products.json`, with an additional built-in JavaScript fallback so the store still works when opened directly.

Flow:

API → Fetch → JavaScript → Product UI

## Cart

Cart information is stored in browser LocalStorage. This allows the cart to remain available after refreshing the page.

## Challenges

- Handling API loading and error states
- Keeping search, category filtering and sorting working together
- Maintaining cart quantity and subtotal
- Making the layout responsive across different screen sizes

## Running Locally

Open the project using a local server such as VS Code Live Server.

For example:

1. Open the folder in VS Code.
2. Install/use Live Server.
3. Open `index.html` with Live Server.
4. Test search, filters, product details and cart.
