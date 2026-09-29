const API_URL = "https://fakestoreapi.com/products";
const productId = new URLSearchParams(window.location.search).get("id");

const detailsLoading = document.getElementById("detailsLoading");
const detailsError = document.getElementById("detailsError");
const productDetails = document.getElementById("productDetails");

let currentProduct = null;
let quantity = 1;

async function loadProduct() {
    if (!productId) {
        showDetailsError();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`);

        if (!response.ok) {
            throw new Error("Product not found");
        }

        currentProduct = await response.json();

        // Keep the product image local for a reliable demo.
        const imageNumber = Number(productId);
        currentProduct.image = `images/product-${imageNumber}.svg`;

        displayProduct(currentProduct);
    } catch (error) {
        const localProduct = LOCAL_PRODUCTS.find(
            product => String(product.id) === String(productId)
        );

        if (!localProduct) {
            showDetailsError();
            return;
        }

        currentProduct = localProduct;
        displayProduct(currentProduct);
    }
}

function displayProduct(product) {
    detailsLoading.style.display = "none";
    detailsError.style.display = "none";
    productDetails.style.display = "grid";

    document.getElementById("productImage").src = product.image;
    document.getElementById("productImage").alt = product.title;
    document.getElementById("productCategory").textContent = product.category;
    document.getElementById("productName").textContent = product.title;
    document.getElementById("productRating").textContent = product.rating?.rate ?? "N/A";
    document.getElementById("productDescription").textContent = product.description;
    document.getElementById("productPrice").textContent = Number(product.price).toFixed(2);
}

function showDetailsError() {
    detailsLoading.style.display = "none";
    productDetails.style.display = "none";
    detailsError.style.display = "block";
}

document.getElementById("increaseQty").addEventListener("click", () => {
    quantity++;
    document.getElementById("productQuantity").textContent = quantity;
});

document.getElementById("decreaseQty").addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        document.getElementById("productQuantity").textContent = quantity;
    }
});

document.getElementById("addToCart").addEventListener("click", () => {
    if (currentProduct) {
        addToCart(currentProduct, quantity);
    }
});

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

loadProduct();
