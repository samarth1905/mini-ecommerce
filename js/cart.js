const cartKey = "miniStoreCart";

function getCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: Number(product.price),
            image: product.image,
            quantity: quantity
        });
    }

    saveCart(cart);
    updateCartCount();
    renderCart();
}

function changeQuantity(id, amount) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        const updatedCart = cart.filter(product => product.id !== id);
        saveCart(updatedCart);
    } else {
        saveCart(cart);
    }

    updateCartCount();
    renderCart();
}

function removeFromCart(id) {
    const cart = getCart().filter(product => product.id !== id);
    saveCart(cart);
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const countElement = document.getElementById("cartCount");
    if (!countElement) return;

    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    countElement.textContent = count;
}

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems || !cartTotal) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        cartTotal.textContent = "0.00";
        return;
    }

    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <h3>${item.title}</h3>
                    <p>₹${item.price.toFixed(2)}</p>
                    <div class="cart-controls">
                        <button onclick="changeQuantity(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    cartTotal.textContent = total.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderCart();

    const cartBtn = document.getElementById("cartBtn");
    const closeCart = document.getElementById("closeCart");
    const cartOverlay = document.getElementById("cartOverlay");

    if (cartBtn && cartOverlay) {
        cartBtn.addEventListener("click", () => {
            cartOverlay.classList.add("show");
            renderCart();
        });
    }

    if (closeCart && cartOverlay) {
        closeCart.addEventListener("click", () => {
            cartOverlay.classList.remove("show");
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", (event) => {
            if (event.target === cartOverlay) {
                cartOverlay.classList.remove("show");
            }
        });
    }
});
