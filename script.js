

// 2. GLOBAL STATE
let cart = JSON.parse(localStorage.getItem('bakery_cart')) || [];
let currentModalQty = 1;

// 3. UI UPDATE (Counting Update)
function updateUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.innerText = count;
        // Chota animation effect
        cartBadge.classList.add('scale-125');
        setTimeout(() => cartBadge.classList.remove('scale-125'), 200);
    }
    localStorage.setItem('bakery_cart', JSON.stringify(cart));
    // Aaj ki date se pehle ki dates disable karne ke liye
const dateInput = document.getElementById('delivery-date');
if(dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today; // Default aaj ki date select hogi
}
}

// 4. QUICK ADD LOGIC (Direct from Card)
 window.addToCart=function(id, name, price, img) {
    const existing = cart.find(item => item.id === id);
    if(existing) {
        existing.qty += 1;
    } else {
        cart.push({id, name, price, img, qty: 1});
    }
    updateUI();
    showToast(`${name} added!`);
}

// 5. MODAL LOGIC (Details & Quantity)
// 4.5 RENDER PRODUCTS LOGIC (Optimized for Speed)
// Is function ko apne JS file ke bilkul niche paste karein
window.renderProducts = function(dataToShow) {
    const container = document.getElementById('product-grid');
    if (!container) return;

    container.innerHTML = '';
    const productsArray = Array.isArray(dataToShow) ? dataToShow : Object.values(dataToShow);

    productsArray.forEach((p) => {
        const card = `
        <div class="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition group cursor-pointer" onclick="openProduct('${p.id}')">
            <div class="relative h-64 overflow-hidden bg-stone-100">
                <img src="${p.img}?auto=format&fit=crop&w=500&q=70"
                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
            </div>
            <div class="p-6">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold text-stone-900">${p.name}</h3>
                    <span class="text-amber-800 font-bold text-lg">RS. ${p.price}</span>
                </div>
                <p class="text-stone-500 text-sm mb-6">${p.desc || 'Freshly baked GoldenWhisk treat.'}</p>
                <button onclick="event.stopPropagation(); addToCart('${p.id}', '${p.name}', ${p.price}, '${p.img}')"
                        class="w-full py-3 border-2 border-stone-800 text-stone-800 font-bold rounded-xl hover:bg-stone-800 hover:text-white transition">
                    Quick Add
                </button>
            </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Ready - Initializing Products...");
    if (typeof products !== 'undefined') {
        renderProducts(products);
    }
});
 window.openProduct=function(id) {
    const p = products[id];
    const modal = document.getElementById('product-modal');
    const content = document.getElementById('modal-content');
    currentModalQty = 1; // Reset qty every time modal opens

    content.innerHTML = `
        <div class="flex flex-col md:flex-row">
            <div class="w-full md:w-1/2 h-64 sm:h-80 md:h-[500px] skeleton overflow-hidden bg-stone-100 shrink-0">
                <img src="${p.img}?auto=format&fit=crop&w=600&q=75" loading="lazy" onload="this.parentElement.classList.remove('skeleton')" class="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105">
            </div>
            <div class="md:w-1/2 p-10 bg-white">
                <span class="text-amber-700 font-bold text-xs uppercase tracking-widest font-sans">Freshly Baked</span>
                <h2 class="serif text-4xl mb-4 mt-2 font-bold text-stone-900">${p.name}</h2>
                <p class="text-amber-800 font-bold text-2xl mb-4 italic">RS. ${p.price}</p>
                <p class="text-stone-500 mb-8 leading-relaxed font-sans">${p.desc}</p>

                <div class="flex items-center gap-4 mb-6">
                    <div class="flex items-center border-2 border-stone-200 rounded-lg overflow-hidden">
                        <button onclick="changeModalQty(-1)" class="px-4 py-2 hover:bg-stone-100 transition font-bold text-xl">-</button>
                        <span id="modal-qty" class="px-6 font-bold text-stone-800 text-lg">1</span>
                        <button onclick="changeModalQty(1)" class="px-4 py-2 hover:bg-stone-100 transition font-bold text-xl">+</button>
                    </div>
                </div>

                <button onclick="confirmAddToCart('${id}')"
                        class="w-full bg-amber-800 text-white py-4 rounded-xl font-bold hover:bg-amber-900 transition shadow-lg flex justify-center gap-2">
                    Add to Basket
                </button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

window.changeModalQty=function(val) {
    if(currentModalQty + val >= 1) {
        currentModalQty += val;
        document.getElementById('modal-qty').innerText = currentModalQty;
    }
}
window.confirmAddToCart = function(id) {
    const p = window.products[id]; // Ensure karein window.products available hai
    if(!p) return alert("Product data not found!");

    const existing = cart.find(item => item.id === id);
    if(existing) {
        existing.qty += currentModalQty;
    } else {
        cart.push({
            id: id,
            name: p.name,
            price: p.price,
            img: p.img,
            qty: currentModalQty
        });
    }

    updateUI();
    closeModal();
    showToast(`${p.name} added to basket!`);
}
 window.closeModal=function() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// 6. HELPER: TOAST NOTIFICATION
window.showToast=function(msg) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-5 right-5 bg-stone-900 text-white px-6 py-3 rounded-xl z-[200] shadow-2xl animate-bounce font-sans text-sm";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Page load initialization
updateUI();
// 1. Toggle Drawer
window.toggleCart=function() {
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('hidden');
    renderCart(); // Refresh list every time it opens
}

// 2. Render Cart Items
window.renderCart=function () {
    const container = document.getElementById('cart-items-list');
    const totalElement = document.getElementById('cart-total');
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-center text-stone-400 mt-10">Your basket is empty.</p>`;
        totalElement.innerText = `RS. 0`;
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        total += item.price * item.qty;
        return `
            <div class="flex items-center gap-4 border-b border-stone-50 pb-4">
                <img src="${item.img}" class="w-20 h-20 object-cover rounded-xl shadow-sm">
                <div class="flex-1">
                    <h4 class="font-bold text-stone-900">${item.name}</h4>
                    <p class="text-stone-500 text-sm">RS.${item.price} x ${item.qty}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 font-bold">×</button>
            </div>
        `;
    }).join('');

    totalElement.innerText = `RS. ${total}`;
}

// 3. Remove Item
window.removeFromCart=function(index) {
    cart.splice(index, 1);
    updateUI();
    renderCart();
}

// 4. THE BUSINESS SOLUTION: WhatsApp Order Generator
window.sendWhatsAppOrder = function() {
    const name = document.getElementById('cart-cust-name').value.trim();
    const address = document.getElementById('cart-cust-address').value.trim();
    const date = document.getElementById('cart-delivery-date').value;
    const time = document.getElementById('cart-delivery-time').value;

    const phoneNumber = window.siteWhatsApp || "923110297772";

    if (cart.length === 0) {
        showToast("Your basket is empty!");
        return;
    }

    if (!name || !address || !date) {
        showToast("Please fill Name, Address, and Delivery Date!");
        return;
    }

    // Professional Receipt Formatting
    let message = "✨ *NEW ORDER: GOLDEN WHISK* ✨\n";
    message += "━━━━━━━━━━━━━━━━━━\n";
    message += `👤 *Customer:* ${name}\n`;
    message += `📍 *Address:* ${address}\n`;
    message += `📅 *Date:* ${date}\n`;
    message += `🕒 *Slot:* ${time || 'Not specified'}\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "🎂 *ORDER ITEMS:*\n";

    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        message += `${index + 1}. ${item.name}\n`;
        message += `   _Qty: ${item.qty} x Rs. ${item.price}_ = *Rs. ${itemTotal}*\n\n`;
        total += itemTotal;
    });

    message += "━━━━━━━━━━━━━━━━━━\n";
    message += `💰 *TOTAL PAYABLE: Rs. ${total}*\n`;
    message += "━━━━━━━━━━━━━━━━━━\n\n";
    message += "✅ _Thank you for choosing GoldenWhisk!_";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
};
// Smooth Scrolling Logic
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Agar sirf "#" hai toh top par le jao
        if (this.getAttribute('href') === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
window.scrollToSection=function(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        console.error("Section with ID '" + id + "' not found!");
    }
}
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const path = document.getElementById('icon-path');

    menu.classList.toggle('hidden');

    if (menu.classList.contains('hidden')) {
        // Hamburger Icon
        path.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7');
    } else {
        // "X" Close Icon
        path.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    }
}
// 2. Filter Function
window.filterProducts = function(category) {
    const buttons = document.querySelectorAll('.filter-btn');

    // UI Highlight
    buttons.forEach(btn => {
        btn.classList.remove('bg-amber-800', 'text-white');
        btn.classList.add('text-stone-600');
    });
    if (event) event.currentTarget.classList.add('bg-amber-800', 'text-white');

    // Filter Logic
    const selectedCat = category.toLowerCase().trim();
    if (selectedCat === 'all') {
        renderProducts(window.products);
    } else {
        const filtered = Object.values(window.products).filter(p =>
            p.category.toLowerCase().trim() === selectedCat
        );
        renderProducts(filtered);
    }
}
// 3. Search Function
window.searchProducts=function() {
    const query = document.getElementById('product-search').value.toLowerCase();
    const cards = document.querySelectorAll('#product-grid > div');

    cards.forEach(card => {
        const productID = card.getAttribute('data-id');
        const productName = products[productID].name.toLowerCase();

        if (productName.includes(query)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}
window.sendCustomOrder = function() {
    // 1. Form se data uthana
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const flavor = document.getElementById('cake-flavor').value;
    const weight = document.getElementById('cake-weight').value;
    const date = document.getElementById('delivery-date').value;
    const msg = document.getElementById('cake-msg').value;

    // 2. Validation (Check karna ke zaroori cheezain bhari hain ya nahi)
    if (!name || !phone || !date || !flavor) {
        showToast("Please fill all required fields! 🍰");
        return;
    }

    // 3. WhatsApp Message Design (Khubsurat formatting ke sath)
    const message = `*🍰 NEW CUSTOM CAKE ENQUIRY 🍰*%0A` +
                    `--------------------------------%0A` +
                    `*👤 Customer:* ${name}%0A` +
                    `*📞 Contact:* ${phone}%0A` +
                    `*🎂 Flavor:* ${flavor}%0A` +
                    `*⚖️ Weight:* ${weight}%0A` +
                    `*📅 Date:* ${date}%0A` +
                    `*📝 Message:* ${msg || 'No special message'}%0A` +
                    `--------------------------------%0A` +
                    `_Sent via GoldenWhisk Website_`;

    // 4. Admin ke WhatsApp number par bhej dena
    // Note: window.siteWhatsApp aapki firebase settings se aa raha hai
    const whatsappUrl = `https://wa.me/${window.siteWhatsApp}?text=${message}`;

    // Naye tab mein WhatsApp kholna
    window.open(whatsappUrl, '_blank');
};
const initProducts = () => {
    console.log("Checking for products data...");
    const data = window.products || products; // Dono options check karein

    if (data) {
        console.log("Data found! Rendering now...");
        renderProducts(data);
    } else {
        console.error("Data still not found. Retrying in 500ms...");
        setTimeout(initProducts, 500); // Agar data nahi mila toh thori dair baad phir check karein
    }
};

// Jab DOM ready ho jaye tab start karein
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProducts);
} else {
    initProducts();
}