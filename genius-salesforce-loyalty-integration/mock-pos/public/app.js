const API_BASE = 'http://localhost:4000/api';
const LOYALTY_API_BASE = 'http://localhost:3000/api';

let products = [];
let currentOrder = [];
let config = {};
let loyaltyMember = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    await loadProducts();
    await loadTransactions();
    renderProducts();
    updateOrderDisplay();
});

// Load config
async function loadConfig() {
    try {
        const response = await fetch(`${API_BASE}/config`);
        config = await response.json();
        document.getElementById('storeId').textContent = config.storeId;
        document.getElementById('terminalId').textContent = config.terminalId;
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render products
function renderProducts(category = 'all') {
    const grid = document.getElementById('productGrid');
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="addToOrder('${product.id}')">
            <div class="product-icon">${getProductIcon(product.category)}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
    `).join('');
}

function getProductIcon(category) {
    const icons = {
        'Burgers': '🍔',
        'Chicken': '🍗',
        'Sides': '🍟',
        'Drinks': '🥤'
    };
    return icons[category] || '🍽️';
}

// Filter products by category
function filterCategory(category) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderProducts(category);
}

// Add item to order
function addToOrder(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = currentOrder.find(item => item.itemId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentOrder.push({
            itemId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            modifiers: []
        });
    }
    
    updateOrderDisplay();
}

// Update order display
function updateOrderDisplay() {
    const orderItems = document.getElementById('orderItems');
    const completeBtn = document.getElementById('completeBtn');
    
    if (currentOrder.length === 0) {
        orderItems.innerHTML = '<p class="empty-cart">Cart is empty</p>';
        completeBtn.disabled = true;
    } else {
        completeBtn.disabled = false;
        orderItems.innerHTML = currentOrder.map((item, index) => `
            <div class="order-item">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <span class="remove-btn" onclick="removeItem(${index})">×</span>
                </div>
            </div>
        `).join('');
    }
    
    updateSummary();
    checkLoyaltyMember();
}

// Update quantity
function updateQuantity(index, change) {
    currentOrder[index].quantity += change;
    if (currentOrder[index].quantity <= 0) {
        removeItem(index);
    } else {
        updateOrderDisplay();
    }
}

// Remove item
function removeItem(index) {
    currentOrder.splice(index, 1);
    updateOrderDisplay();
}

// Update summary
function updateSummary() {
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Check loyalty member
async function checkLoyaltyMember() {
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    const preview = document.getElementById('loyaltyPreview');
    
    if (!phone && !email) {
        preview.style.display = 'none';
        loyaltyMember = null;
        return;
    }
    
    try {
        const query = phone ? `phone=${phone.replace(/\D/g, '')}` : `email=${email}`;
        const response = await fetch(`${LOYALTY_API_BASE}/loyalty/member/lookup?${query}`);
        const data = await response.json();
        
        if (data.found) {
            loyaltyMember = data.member;
            const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const pointsResponse = await fetch(`${LOYALTY_API_BASE}/loyalty/calculate-points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: subtotal })
            });
            const pointsData = await pointsResponse.json();
            
            document.getElementById('memberName').textContent = 
                `${loyaltyMember.firstName || ''} ${loyaltyMember.lastName || ''}`.trim() || 'Member';
            document.getElementById('memberPoints').textContent = loyaltyMember.pointsBalance;
            document.getElementById('pointsToEarn').textContent = pointsData.calculation.totalPoints;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
            loyaltyMember = null;
        }
    } catch (error) {
        console.error('Error checking loyalty member:', error);
        preview.style.display = 'none';
        loyaltyMember = null;
    }
}

// Add event listeners for customer inputs
document.getElementById('customerPhone').addEventListener('input', 
    debounce(checkLoyaltyMember, 500));
document.getElementById('customerEmail').addEventListener('input', 
    debounce(checkLoyaltyMember, 500));

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Clear order
function clearOrder() {
    if (confirm('Clear current order?')) {
        currentOrder = [];
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerEmail').value = '';
        loyaltyMember = null;
        updateOrderDisplay();
    }
}

// Complete order
async function completeOrder() {
    if (currentOrder.length === 0) return;
    
    try {
        const phone = document.getElementById('customerPhone').value;
        const email = document.getElementById('customerEmail').value;
        
        const response = await fetch(`${API_BASE}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: currentOrder,
                customerPhone: phone || undefined,
                customerEmail: email || undefined
            })
        });
        
        const transaction = await response.json();
        
        // Show success modal
        showSuccess(transaction);
        
        // Clear order
        currentOrder = [];
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerEmail').value = '';
        loyaltyMember = null;
        updateOrderDisplay();
        
        // Reload transactions
        await loadTransactions();
    } catch (error) {
        console.error('Error completing order:', error);
        alert('Error completing transaction: ' + error.message);
    }
}

// Show success modal
function showSuccess(transaction) {
    const modal = document.getElementById('successModal');
    const details = document.getElementById('successDetails');
    
    details.innerHTML = `
        <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
        <p><strong>Total:</strong> $${transaction.totalAmount.toFixed(2)}</p>
        <p><strong>Items:</strong> ${transaction.items.length}</p>
        ${transaction.webhookSent ? 
            '<p class="webhook-status webhook-success">✓ Webhook sent to loyalty system</p>' :
            '<p class="webhook-status webhook-error">✗ Webhook failed</p>'}
        ${loyaltyMember ? 
            `<p style="margin-top: 15px;"><strong>Loyalty points will be awarded!</strong></p>` : 
            '<p style="margin-top: 15px;">Tip: Enter phone or email to earn loyalty points!</p>'}
    `;
    
    modal.classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transactions`);
        const transactions = await response.json();
        renderTransactions(transactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Render transactions
function renderTransactions(transactions) {
    const list = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        list.innerHTML = '<p class="empty-cart">No transactions yet</p>';
        return;
    }
    
    list.innerHTML = transactions.map(t => `
        <div class="transaction-item ${t.status === 'voided' ? 'voided' : ''}">
            <div class="transaction-header">
                <span class="transaction-id">${t.transactionId}</span>
                <span class="transaction-status status-${t.status}">${t.status.toUpperCase()}</span>
            </div>
            <div class="transaction-details">
                <span>${new Date(t.timestamp).toLocaleString()}</span>
                <span class="transaction-amount">$${t.totalAmount.toFixed(2)}</span>
            </div>
            <div class="transaction-details">
                <span>${t.items.length} items</span>
                ${t.customerPhone ? `<span>📞 ${t.customerPhone}</span>` : ''}
            </div>
            ${t.webhookSent !== undefined ? 
                `<div class="webhook-status ${t.webhookSent ? 'webhook-success' : 'webhook-error'}">
                    ${t.webhookSent ? '✓ Webhook sent' : '✗ Webhook failed'}
                </div>` : ''}
            ${t.status === 'completed' ? 
                `<div class="transaction-actions">
                    <button class="btn btn-small btn-danger" onclick="voidTransaction('${t.transactionId}')">
                        Void Transaction
                    </button>
                </div>` : ''}
        </div>
    `).join('');
}

// Void transaction
async function voidTransaction(transactionId) {
    if (!confirm('Void this transaction? This will reverse loyalty points.')) {
        return;
    }
    
    try {
        await fetch(`${API_BASE}/transactions/${transactionId}/void`, {
            method: 'POST'
        });
        
        alert('Transaction voided successfully');
        await loadTransactions();
    } catch (error) {
        console.error('Error voiding transaction:', error);
        alert('Error voiding transaction: ' + error.message);
    }
}

// Clear transactions
async function clearTransactions() {
    if (!confirm('Clear all transactions? This cannot be undone.')) {
        return;
    }
    
    try {
        await fetch(`${API_BASE}/transactions`, {
            method: 'DELETE'
        });
        await loadTransactions();
    } catch (error) {
        console.error('Error clearing transactions:', error);
    }
}

// Settings
function openSettings() {
    document.getElementById('settingsStoreId').value = config.storeId;
    document.getElementById('settingsTerminalId').value = config.terminalId;
    document.getElementById('settingsWebhookUrl').value = config.webhookUrl;
    document.getElementById('settingsWebhookEnabled').checked = config.webhookEnabled;
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

async function saveSettings() {
    const newConfig = {
        storeId: document.getElementById('settingsStoreId').value,
        terminalId: document.getElementById('settingsTerminalId').value,
        webhookUrl: document.getElementById('settingsWebhookUrl').value,
        webhookEnabled: document.getElementById('settingsWebhookEnabled').checked
    };
    
    try {
        const response = await fetch(`${API_BASE}/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        });
        
        config = await response.json();
        document.getElementById('storeId').textContent = config.storeId;
        document.getElementById('terminalId').textContent = config.terminalId;
        closeSettings();
        alert('Settings saved successfully');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings: ' + error.message);
    }
}

async function testWebhook() {
    const resultDiv = document.getElementById('webhookTestResult');
    resultDiv.textContent = 'Testing webhook...';
    resultDiv.style.background = '#ffc107';
    resultDiv.style.color = '#000';
    
    try {
        const testTransaction = {
            transactionId: 'test_' + Date.now(),
            storeId: config.storeId,
            totalAmount: 10.00,
            status: 'completed',
            items: []
        };
        
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'transaction.created',
                eventId: 'test_event_' + Date.now(),
                timestamp: new Date().toISOString(),
                data: testTransaction
            })
        });
        
        if (response.ok) {
            resultDiv.textContent = '✓ Webhook test successful!';
            resultDiv.style.background = '#d4edda';
            resultDiv.style.color = '#155724';
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        resultDiv.textContent = '✗ Webhook test failed: ' + error.message;
        resultDiv.style.background = '#f8d7da';
        resultDiv.style.color = '#721c24';
    }
}
