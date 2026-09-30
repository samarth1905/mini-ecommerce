const API_URL = "https://fakestoreapi.com/products";

let products = [];
let filteredProducts = [];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const empty = document.getElementById("empty");
const clearFilters = document.getElementById("clearFilters");

async function loadProducts() {
    showState("loading");

    // MAIN STORE: load our own products first
    try {
        const localResponse = await fetch("data/products.json");

        if (!localResponse.ok) {
            throw new Error("Local product data unavailable");
        }

        products = await localResponse.json();

        filteredProducts = [...products];
        createCategories();
        displayProducts(filteredProducts);
        showState("products");

        console.log("LOCAL PRODUCTS LOADED:", products);

    } catch (localError) {
        console.error("Local products failed:", localError);

        products = getFallbackProducts();

        filteredProducts = [...products];
        createCategories();
        displayProducts(filteredProducts);
        showState("products");
    }

    // API integration — does NOT replace our local products
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const apiProducts = await response.json();

        console.log(
            "API CONNECTED:",
            apiProducts.length,
            "external products"
        );

    } catch (apiError) {
        console.warn(
            "API unavailable. Local products continue.",
            apiError
        );
    }
}

function getFallbackProducts() {
    return LOCAL_PRODUCTS;
}

const LOCAL_PRODUCTS = [
    {
        "id": 1,
        "title": "Wireless Headphones",
        "price": 2499,
        "description": "Comfortable wireless headphones with clear sound and a simple everyday design.",
        "category": "electronics",
        "rating": {
            "rate": 4.5,
            "count": 57
        },
        "image": "images/product-1.svg"
    },
    {
        "id": 2,
        "title": "Smartphone",
        "price": 15999,
        "description": "A practical smartphone with a bright display and reliable performance.",
        "category": "electronics",
        "rating": {
            "rate": 4.3,
            "count": 64
        },
        "image": "images/product-2.svg"
    },
    {
        "id": 3,
        "title": "Laptop Backpack",
        "price": 1899,
        "description": "A compact backpack designed for laptops, books and daily travel.",
        "category": "bags",
        "rating": {
            "rate": 4.2,
            "count": 71
        },
        "image": "images/product-3.svg"
    },
    {
        "id": 4,
        "title": "Mens Casual Shirt",
        "price": 1299,
        "description": "A comfortable casual shirt suitable for everyday wear.",
        "category": "men's clothing",
        "rating": {
            "rate": 4.4,
            "count": 78
        },
        "image": "images/product-4.svg"
    },
    {
        "id": 5,
        "title": "Mens Cotton Jacket",
        "price": 2299,
        "description": "A lightweight cotton jacket with a clean casual look.",
        "category": "men's clothing",
        "rating": {
            "rate": 4.1,
            "count": 85
        },
        "image": "images/product-5.svg"
    },
    {
        "id": 6,
        "title": "Womens Jacket",
        "price": 2499,
        "description": "A stylish everyday jacket with a comfortable fit.",
        "category": "women's clothing",
        "rating": {
            "rate": 4.6,
            "count": 92
        },
        "image": "images/product-6.svg"
    },
    {
        "id": 7,
        "title": "Gold Plated Bracelet",
        "price": 899,
        "description": "A simple gold plated bracelet for casual and special occasions.",
        "category": "jewelry",
        "rating": {
            "rate": 4.0,
            "count": 99
        },
        "image": "images/product-7.svg"
    },
    {
        "id": 8,
        "title": "Silver Ring",
        "price": 699,
        "description": "A minimal silver ring with a clean and classic finish.",
        "category": "jewelry",
        "rating": {
            "rate": 4.2,
            "count": 106
        },
        "image": "images/product-8.svg"
    },
    {
        "id": 9,
        "title": "Classic Watch",
        "price": 1999,
        "description": "A classic wrist watch designed for everyday use.",
        "category": "jewelry",
        "rating": {
            "rate": 4.4,
            "count": 113
        },
        "image": "images/product-9.svg"
    },
    {
        "id": 10,
        "title": "Casual T-Shirt",
        "price": 799,
        "description": "A soft casual t-shirt made for comfortable daily wear.",
        "category": "men's clothing",
        "rating": {
            "rate": 4.3,
            "count": 120
        },
        "image": "images/product-10.svg"
    },
    {
        "id": 11,
        "title": "Women's T-Shirt",
        "price": 899,
        "description": "A simple everyday t-shirt with a comfortable fit.",
        "category": "women's clothing",
        "rating": {
            "rate": 4.1,
            "count": 127
        },
        "image": "images/product-11.svg"
    },
    {
        "id": 12,
        "title": "USB Charging Cable",
        "price": 499,
        "description": "A useful charging cable for everyday devices.",
        "category": "electronics",
        "rating": {
            "rate": 4.0,
            "count": 134
        },
        "image": "images/product-12.svg"
    },
    {
        "id": 13,
        "title": "Bluetooth Speaker",
        "price": 1499,
        "description": "Portable Bluetooth speaker with clear audio for everyday use.",
        "category": "electronics",
        "rating": {
            "rate": 4.3,
            "count": 141
        },
        "image": "images/product-13.svg"
    },
    {
        "id": 14,
        "title": "Canvas Backpack",
        "price": 1599,
        "description": "A lightweight canvas backpack for college, travel and daily use.",
        "category": "bags",
        "rating": {
            "rate": 4.2,
            "count": 148
        },
        "image": "images/product-14.svg"
    },
    {
        "id": 15,
        "title": "Women's Casual Top",
        "price": 1099,
        "description": "A comfortable casual top designed for everyday wear.",
        "category": "women's clothing",
        "rating": {
            "rate": 4.4,
            "count": 155
        },
        "image": "images/product-15.svg"
    }
];

function createCategories() {
    const categories = [...new Set(products.map(product => product.category))];

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function displayProducts(list) {
    productGrid.innerHTML = "";

    if (list.length === 0) {
        showState("empty");
        return;
    }

    showState("products");

    list.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <a href="product.html?id=${product.id}" class="product-image-link">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
            </a>
            <div class="product-info">
                <span class="category">${product.category}</span>
                <h2>${product.title}</h2>
                <div class="product-bottom">
                    <span class="price">₹${Number(product.price).toFixed(2)}</span>
                    <span class="rating">★ ${product.rating?.rate ?? "N/A"}</span>
                </div>
                <div class="card-actions">
                    <a href="product.html?id=${product.id}" class="details-btn">View Details</a>
                    <button class="add-cart-btn" onclick="addProduct(${product.id})">Add to Cart</button>
                </div>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

function addProduct(id) {
    const product = products.find(item => item.id === id);
    if (product) {
        addToCart(product);
    }
}

function applyFilters() {
    const search = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const sort = sortFilter.value;

    filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(search);
        const matchesCategory = category === "all" || product.category === category;
        return matchesSearch && matchesCategory;
    });

    if (sort === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (sort === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    displayProducts(filteredProducts);
}

function showState(state) {
    loading.style.display = state === "loading" ? "block" : "none";
    error.style.display = state === "error" ? "block" : "none";
    empty.style.display = state === "empty" ? "block" : "none";
    productGrid.style.display = state === "products" ? "grid" : "none";
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);

clearFilters.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    sortFilter.value = "default";
    filteredProducts = [...products];
    displayProducts(filteredProducts);
});

loadProducts();
