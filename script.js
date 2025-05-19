// script.js - Improved furniture store functionality

/**
 * Furniture Store Application
 * Features:
 * - Product display with filtering
 * - Shopping cart with add/remove functionality
 * - Cart persistence with localStorage
 * - Mobile-responsive menu
 * - Testimonial slider
 * - Notification system
 * - Form validation
 */

document.addEventListener("DOMContentLoaded", () => {
    // App state
    const state = {
        products: [
            { id: 1, name: "Modern Sofa", price: 799, image: "/api/placeholder/300/200", category: "living-room", description: "Comfortable 3-seater sofa with wooden legs and soft fabric." },
            { id: 2, name: "Wooden Bed", price: 999, image: "/api/placeholder/300/200", category: "bedroom", description: "Elegant queen-sized bed frame with headboard." },
            { id: 3, name: "Dining Table", price: 599, image: "/api/placeholder/300/200", category: "dining-room", description: "6-seater dining table with matching chairs." },
            { id: 4, name: "Office Desk", price: 499, image: "/api/placeholder/300/200", category: "office", description: "Spacious desk with drawer storage for your home office." },
            { id: 5, name: "Coffee Table", price: 349, image: "/api/placeholder/300/200", category: "living-room", description: "Modern coffee table with tempered glass top." },
            { id: 6, name: "Bookshelf", price: 279, image: "/api/placeholder/300/200", category: "living-room", description: "5-tier bookshelf with contemporary design." },
            { id: 7, name: "Bedside Table", price: 149, image: "/api/placeholder/300/200", category: "bedroom", description: "Compact bedside table with drawer and shelf." },
            { id: 8, name: "Ergonomic Chair", price: 399, image: "/api/placeholder/300/200", category: "office", description: "Comfortable ergonomic chair for long working hours." }
        ],
        cart: [],
        currentFilter: "all",
        testimonialIndex: 0
    };

    // DOM Elements
    const elements = {
        mobileMenu: document.querySelector(".mobile-menu"),
        navLinks: document.querySelector(".nav-links"),
        cartIcon: document.getElementById("cartIcon"),
        cartModal: document.getElementById("cartModal"),
        closeModal: document.getElementById("closeModal"),
        productsGrid: document.getElementById("productsGrid"),
        cartItems: document.getElementById("cartItems"),
        cartCount: document.getElementById("cartCount"),
        cartTotal: document.getElementById("cartTotal"),
        checkoutBtn: document.getElementById("checkoutBtn"),
        categoryCards: document.querySelectorAll(".category-card"),
        testimonials: document.querySelectorAll(".testimonial"),
        sliderDots: document.querySelectorAll(".slider-dot"),
        newsletterForm: document.querySelector(".newsletter-form")
    };

    // Initialize the application
    function init() {
        loadCartFromStorage();
        setupEventListeners();
        renderProducts();
        updateCartUI();
        setupTestimonialSlider();
        injectStyles();
    }

    // Event Listeners
    function setupEventListeners() {
        // Mobile menu toggle
        elements.mobileMenu.addEventListener("click", toggleMobileMenu);

        // Cart modal
        elements.cartIcon.addEventListener("click", openCartModal);
        elements.closeModal.addEventListener("click", closeCartModal);
        window.addEventListener("click", (e) => {
            if (e.target === elements.cartModal) closeCartModal();
        });

        // Category filtering
        elements.categoryCards.forEach(card => {
            card.addEventListener("click", () => {
                const category = card.dataset.category;
                filterProducts(category);
            });
        });

        // Newsletter subscription
        if (elements.newsletterForm) {
            elements.newsletterForm.addEventListener("submit", handleNewsletterSubmission);
        }

        // Checkout
        if (elements.checkoutBtn) {
            elements.checkoutBtn.addEventListener("click", handleCheckout);
        }
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
        elements.navLinks.classList.toggle("active");
    }

    // Cart Modal Functions
    function openCartModal() {
        elements.cartModal.style.display = "block";
        // Add animation class
        setTimeout(() => {
            elements.cartModal.querySelector(".modal-content").classList.add("modal-active");
        }, 10);
    }

    function closeCartModal() {
        const modalContent = elements.cartModal.querySelector(".modal-content");
        modalContent.classList.remove("modal-active");
        
        // Wait for animation to finish before hiding
        setTimeout(() => {
            elements.cartModal.style.display = "none";
        }, 300);
    }

    // Product Rendering
    function renderProducts() {
        if (!elements.productsGrid) return;
        
        elements.productsGrid.innerHTML = "";
        
        const productsToRender = state.currentFilter === "all" 
            ? state.products 
            : state.products.filter(p => p.category === state.currentFilter);
        
        if (productsToRender.length === 0) {
            elements.productsGrid.innerHTML = `
                <div class="no-products">
                    <p>No products found in this category.</p>
                </div>
            `;
            return;
        }
        
        productsToRender.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.dataset.id = product.id;
            
            productCard.innerHTML = `
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            
            elements.productsGrid.appendChild(productCard);
        });

        // Add event listeners to the newly created buttons
        document.querySelectorAll(".add-to-cart").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.target.dataset.id);
                addToCart(id);
            });
        });
    }

    // Filter products by category
    function filterProducts(category) {
        state.currentFilter = category || "all";
        renderProducts();
        
        // Update active category styling
        elements.categoryCards.forEach(card => {
            if (card.dataset.category === category) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }
        });
    }

    // Cart Functions
    function addToCart(productId) {
        const product = state.products.find(p => p.id === productId);
        if (!product) {
            showNotification("Product not found", "error");
            return;
        }

        const existingItem = state.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            state.cart.push({ ...product, quantity: 1 });
        }
        
        updateCartUI();
        saveCartToStorage();
        showNotification(`${product.name} added to cart!`, "success");
    }

    function removeFromCart(productId) {
        const itemIndex = state.cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        
        const item = state.cart[itemIndex];
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            state.cart.splice(itemIndex, 1);
        }
        
        updateCartUI();
        saveCartToStorage();
        showNotification(`Item removed from cart`, "info");
    }

    function clearCart() {
        state.cart = [];
        updateCartUI();
        saveCartToStorage();
    }

    function updateCartUI() {
        if (!elements.cartItems || !elements.cartCount || !elements.cartTotal) return;
        
        // Update cart count
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCount.textContent = totalItems;
        
        // Render cart items
        elements.cartItems.innerHTML = "";
        
        if (state.cart.length === 0) {
            elements.cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <a href="#products" class="btn" onclick="closeCartModal()">Browse Products</a>
                </div>
            `;
        } else {
            state.cart.forEach(item => {
                const cartItem = document.createElement("div");
                cartItem.classList.add("cart-item");
                
                cartItem.innerHTML = `
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" data-id="${item.id}">&times;</button>
                `;
                
                elements.cartItems.appendChild(cartItem);
            });
            
            // Add event listeners to cart item buttons
            document.querySelectorAll(".quantity-btn.minus").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = parseInt(e.target.dataset.id);
                    removeFromCart(id);
                });
            });
            
            document.querySelectorAll(".quantity-btn.plus").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = parseInt(e.target.dataset.id);
                    addToCart(id);
                });
            });
            
            document.querySelectorAll(".remove-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = parseInt(e.target.dataset.id);
                    const item = state.cart.find(i => i.id === id);
                    if (item) {
                        state.cart = state.cart.filter(i => i.id !== id);
                        updateCartUI();
                        saveCartToStorage();
                        showNotification(`${item.name} removed from cart`, "info");
                    }
                });
            });
        }
        
        // Update cart total
        const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        elements.cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Local Storage Functions
    function saveCartToStorage() {
        localStorage.setItem("archiply_cart", JSON.stringify(state.cart));
    }

    function loadCartFromStorage() {
        const savedCart = localStorage.getItem("archiply_cart");
        if (savedCart) {
            try {
                state.cart = JSON.parse(savedCart);
            } catch (error) {
                console.error("Error loading cart from storage:", error);
                state.cart = [];
            }
        }
    }

    // Testimonial Slider
    function setupTestimonialSlider() {
        if (!elements.testimonials.length || !elements.sliderDots.length) return;
        
        function showSlide(index) {
            elements.testimonials.forEach(t => t.classList.remove("active"));
            elements.sliderDots.forEach(d => d.classList.remove("active"));
            
            elements.testimonials[index].classList.add("active");
            elements.sliderDots[index].classList.add("active");
            state.testimonialIndex = index;
        }
        
        elements.sliderDots.forEach((dot, index) => {
            dot.addEventListener("click", () => showSlide(index));
        });
        
        // Auto slide
        const sliderInterval = setInterval(() => {
            const nextIndex = (state.testimonialIndex + 1) % elements.testimonials.length;
            showSlide(nextIndex);
        }, 5000);
        
        // Stop auto slide when user interacts
        elements.sliderDots.forEach(dot => {
            dot.addEventListener("click", () => {
                clearInterval(sliderInterval);
            });
        });
    }

    // Newsletter submission
    function handleNewsletterSubmission(e) {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            showNotification("Please enter your email address", "error");
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification("Please enter a valid email address", "error");
            return;
        }
        
        // Simulate API call
        setTimeout(() => {
            showNotification("Thank you for subscribing to our newsletter!", "success");
            emailInput.value = "";
        }, 1000);
    }

    // Checkout process
    function handleCheckout() {
        if (state.cart.length === 0) {
            showNotification("Your cart is empty", "error");
            return;
        }
        
        // Simulate checkout process
        showNotification("Processing your order...", "info");
        
        setTimeout(() => {
            showNotification("Order placed successfully!", "success");
            clearCart();
            closeCartModal();
        }, 2000);
    }

    // Utility Functions
    function showNotification(message, type = "info") {
        // Remove any existing notifications
        const existingNotification = document.querySelector(".notification");
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => notification.classList.add("show"), 10);
        
        // Close button functionality
        const closeBtn = notification.querySelector(".notification-close");
        closeBtn.addEventListener("click", () => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto close after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove("show");
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Inject CSS for new components
    function injectStyles() {
        const styleElement = document.createElement("style");
        styleElement.textContent = `
            /* Cart Modal Animations */
            .modal {
                transition: opacity 0.3s ease;
            }
            
            .modal-content {
                transform: translateY(-20px);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            
            .modal-content.modal-active {
                transform: translateY(0);
                opacity: 1;
            }
            
            /* Cart Item Styling */
            .cart-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
                position: relative;
            }
            
            .item-image {
                width: 70px;
                height: 70px;
                overflow: hidden;
                border-radius: 5px;
                margin-right: 15px;
            }
            
            .item-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-details h4 {
                margin: 0 0 5px 0;
                font-size: 16px;
            }
            
            .item-price {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .quantity-controls {
                display: flex;
                align-items: center;
            }
            
            .quantity-btn {
                width: 25px;
                height: 25px;
                background: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-weight: bold;
            }
            
            .quantity-btn:hover {
                background: #e5e5e5;
            }
            
            .quantity {
                margin: 0 10px;
                font-weight: bold;
            }
            
            .remove-btn {
                background: none;
                border: none;
                color: #ff4d4d;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
            }
            
            .remove-btn:hover {
                color: #ff0000;
            }
            
            /* Notification System */
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 0;
                max-width: 300px;
                background: white;
                border-radius: 5px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                transform: translateY(100%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                z-index: 1000;
            }
            
            .notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 15px;
            }
            
            .notification.success {
                border-left: 4px solid #4CAF50;
            }
            
            .notification.error {
                border-left: 4px solid #f44336;
            }
            
            .notification.info {
                border-left: 4px solid #2196F3;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #999;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }
            
            /* Empty Cart */
            .empty-cart {
                text-align: center;
                padding: 30px 0;
            }
            
            .empty-cart p {
                margin-bottom: 15px;
                color: #666;
            }
            
            /* Product Cards */
            .product-card {
                border: 1px solid #eee;
                border-radius: 5px;
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .product-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .product-img {
                height: 200px;
                overflow: hidden;
            }
            
            .product-img img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .product-card:hover .product-img img {
                transform: scale(1.05);
            }
            
            .product-info {
                padding: 15px;
            }
            
            .product-name {
                margin-top: 0;
                margin-bottom: 10px;
            }
            
            .product-description {
                color: #666;
                font-size: 14px;
                margin-bottom: 15px;
                height: 40px;
                overflow: hidden;
            }
            
            .product-price {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 15px;
            }
            
            /* Category Cards */
            .category-card {
                cursor: pointer;
                transition: transform 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .category-card::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0;
                height: 3px;
                background-color: #4CAF50;
                transition: width 0.3s ease;
            }
            
            .category-card.active::after,
            .category-card:hover::after {
                width: 100%;
            }
            
            .category-card:hover {
                transform: translateY(-5px);
            }
            
            /* Responsive improvements */
            @media (max-width: 768px) {
                .products-grid {
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                }
                
                .modal-content {
                    margin: 15% auto;
                    width: 90%;
                }
                
                .notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    // Initialize the application
    init();
});