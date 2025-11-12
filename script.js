// Data storage (in a real app, this would be a backend database)
// let users = JSON.parse(localStorage.getItem('wasteManagementUsers')) || [];
// let wasteRecords = JSON.parse(localStorage.getItem('wasteRecords')) || [];
// let collectionRequests = JSON.parse(localStorage.getItem('collectionRequests')) || [];
// let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
// let currentRate = 10; // KES per kg (default rate)
// let rewardPoints = JSON.parse(localStorage.getItem('rewardPoints')) || {};

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const dashboardTabs = document.getElementById('dashboardTabs');
const dashboardContent = document.getElementById('dashboardContent');
const dashboardTitle = document.getElementById('dashboardTitle');
const dashboardSubtitle = document.getElementById('dashboardSubtitle');

// Statistics elements
const usersCount = document.getElementById('usersCount');
const wasteCollected = document.getElementById('wasteCollected');
const recyclingRate = document.getElementById('recyclingRate');
const collectionRequestsCount = document.getElementById('collectionRequests');

if (loginBtn && registerBtn && loginModal && registerModal) {
    loginBtn.addEventListener('click', () => showModal(loginModal));
    registerBtn.addEventListener('click', () => showModal(registerModal));
}

generateTabs();
showTabContent('overview');

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    formData.append("registerForm", "1");

    try {
        const response = await fetch("auth.php", {
            method: "POST",
            body: formData
        });

        const text = (await response.text()).trim();
        console.log("Response:", text);

        if (text.toLowerCase().includes("successful")) {
            alert("✅ " + text);
            registerModal.style.display = "none";
            registerForm.reset();
            loginModal.style.display = "flex";
        } else {
            alert("❌ " + text);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    formData.append("loginForm", "1");

    try {
        const response = await fetch("auth.php", {
            method: "POST",
            body: formData
        });

        const text = await response.text();
        console.log("Login Response:", text);

        if (text.trim() == "login successful") {
            window.location.href = "dashboard.php";
        } else {
            alert("❌ " + text);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
    }
});


window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
});


function showModal(modal) {
    modal.style.display = 'flex';
}

function generateTabs() {
    dashboardTabs.innerHTML = '';
    
    // Common tabs for all users
    const commonTabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'profile', label: 'My Profile' }
    ];
    
    // Role-specific tabs
    let roleTabs = [];
    
    switch(accountType) {
        case 'admin':
            roleTabs = [
                { id: 'wasteRecords', label: 'Waste Records' },
                { id: 'collectionRequests', label: 'Collection Requests' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'settings', label: 'System Settings' }
            ];
            break;
        case 'household':
        case 'company':
            roleTabs = [
                { id: 'requestCollection', label: 'Request Collection' },
                { id: 'myRequests', label: 'My Requests' },
                { id: 'rewards', label: 'My Rewards' }
            ];
            break;
        case 'collector':
            roleTabs = [
                { id: 'myCollections', label: 'My Collections' },
                { id: 'availableRequests', label: 'Available Requests' }
            ];
            break;
        case 'recycler':
            roleTabs = [
                { id: 'wasteCollection', label: 'Waste Collection' },
                { id: 'analytics', label: 'Analytics' }
            ];
            break;
    }
    
    // Combine and create tabs
    const allTabs = [...commonTabs, ...roleTabs];
    
    allTabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.textContent = tab.label;
        tabElement.dataset.tab = tab.id;
        tabElement.addEventListener('click', () => showTabContent(tab.id));
        
        dashboardTabs.appendChild(tabElement);
    });
    
    // Set first tab as active
    dashboardTabs.querySelector('.tab').classList.add('active');
}

function showTabContent(tabId) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        }
    });
    
    // Clear content
    dashboardContent.innerHTML = '';
    
    // Generate content based on tab and user type
    switch(tabId) {
        case 'overview':
            showOverview();
            break;
        case 'profile':
            showProfile();
            break;
        case 'wasteRecords':
            if (accountType === 'admin') showWasteRecords();
            break;
        case 'collectionRequests':
            if (accountType === 'admin') showCollectionRequests();
            break;
        case 'analytics':
            if (accountType === 'admin' || accountType === 'recycler') showAnalytics();
            break;
        case 'settings':
            if (accountType === 'admin') showSettings();
            break;
        case 'requestCollection':
            if (accountType === 'household' || accountType === 'company') showRequestCollection();
            break;
        case 'myRequests':
            if (accountType === 'household' || accountType === 'company') showMyRequests();
            break;
        case 'rewards':
            if (accountType === 'household' || accountType === 'company') showRewards();
            break;
        case 'myCollections':
            if (accountType === 'collector') showMyCollections();
            break;
        case 'availableRequests':
            if (accountType === 'collector') showAvailableRequests();
            break;
        case 'wasteCollection':
            if (currentUser.type === 'recycler') showWasteCollection();
            break;
    }
}

async function fetchDashboardData() {
    const res = await fetch('dashboardData.php');
    const data = await res.json();

    return data;
}

async function showOverview() {
    const { currentUser, accountType, collectionRequests, wasteRecords, users } = await fetchDashboardData();
    let overviewHTML = '';
    
    if (accountType === 'household' || accountType === 'company') {
        const response = await fetch('userRequests.php');
        const data = await response.json();

        if (data.error) {
            alert('Error fetching requests: ' + data.error);
            return;
        }
        const count = data.count || 0;
        const pending = count.pending || 0;
        const completed = count.completed || 0;
        
        overviewHTML = `
            <div class="cards">
                <div class="card">
                    <h3>My Waste Management</h3>
                    <p>Pending Requests: <strong>${pending}</strong></p>
                    <p>Completed Collections: <strong>${completed}</strong></p>
                    <p>Total Waste Disposed: <strong>${completed} kg</strong></p>
                    <p>Reward Points: <strong>${completed * 10 || 0}</strong></p>
                </div>
                <div class="card">
                    <h3>Quick Actions</h3>
                    <button class="btn btn-primary" onclick="showTabContent('requestCollection')">Request Collection</button>
                    <button class="btn btn-info" onclick="showTabContent('rewards')">View Rewards</button>
                </div>
                <div class="card">
                    <h3>Recent Activity</h3>
                    ${getRecentUserActivities()}
                </div>
            </div>
        `;
    } else if (accountType === 'collector') {
        const response = await fetch('userRequests.php');
        const data = await response.json();

        const count = data.count || 0;
        const pending = count.pending || 0;
        const completed = count.completed || 0;
        
        overviewHTML = `
            <div class="cards">
                <div class="card">
                    <h3>My Collections</h3>
                    <p>Pending Collections: <strong>${pending}</strong></p>
                    <p>Completed Collections: <strong>${completed}</strong></p>
                    <p>Total Collections: <strong>${completed}</strong></p>
                </div>
                <div class="card">
                    <h3>Quick Actions</h3>
                    <button class="btn btn-primary" onclick="showTabContent('availableRequests')">View Available Requests</button>
                    <button class="btn btn-info" onclick="showTabContent('myCollections')">My Collections</button>
                </div>
            </div>
        `;
    } else if (accountType === 'recycler') {
        const collectedWaste = wasteRecords.filter(r => r.recyclerId === currentUser.id);
        const totalWaste = collectedWaste.reduce((sum, record) => sum + record.weight, 0);
        
        overviewHTML = `
            <div class="cards">
                <div class="card">
                    <h3>Recycling Summary</h3>
                    <p>Total Waste Collected: <strong>${totalWaste} kg</strong></p>
                    <p>Collections This Month: <strong>${collectedWaste.length}</strong></p>
                </div>
                <div class="card">
                    <h3>Quick Actions</h3>
                    <button class="btn btn-primary" onclick="showTabContent('wasteCollection')">Collect Waste</button>
                    <button class="btn btn-info" onclick="showTabContent('analytics')">View Analytics</button>
                </div>
            </div>
        `;
    } else if (accountType === 'admin') {
        const activeRequests = collectionRequests.filter(r => r.status === 'pending' || r.status === 'in-progress');
        const totalWaste = wasteRecords.reduce((sum, r) => sum + r.weight, 0);
        function calculateRecyclingRate() {            
            return totalWaste > 0 ? Math.round((recycledWaste / totalWaste) * 100) : 0;
        }

        overviewHTML = `
            <div class="cards">
                <div class="card">
                    <h3>System Statistics</h3>
                    <p>Total Users: <strong>${users.length}</strong></p>
                    <p>Active Collection Requests: <strong>${activeRequests.length}</strong></p>
                    <p>Total Waste Collected: <strong>${totalWaste} kg</strong></p>
                    <p>Recycling Rate: <strong>${calculateRecyclingRate()}%</strong></p>
                </div>
                <div class="card">
                    <h3>Quick Actions</h3>
                    <button class="btn btn-primary" onclick="showTabContent('wasteRecords')">Manage Waste Records</button>
                    <button class="btn btn-info" onclick="showTabContent('collectionRequests')">Manage Collection Requests</button>
                    <button class="btn btn-warning" onclick="showTabContent('settings')">System Settings</button>
                </div>
            </div>
        `;
    }
    
    dashboardContent.innerHTML = overviewHTML;
}

// function calculateUserWaste() {
//     const userRecords = wasteRecords.filter(r => r.userId === currentUser.id);
//     return userRecords.reduce((sum, record) => sum + record.weight, 0);
// }

async function getRecentUserActivities() {
    const response = await fetch('userRequests.php');
    const data = await response.json();

    const userRequests = data.requests || [];
    if (userRequests.length === 0) {
        return '<p>No recent activity</p>';
    }

    const sorted = userRequests.sort((a, b) => new Date(b.collectionDate) - new Date(a.collectionDate));
    
    const recent = sorted.slice(0, 3);
    return `
        <ul>
            ${recent.map(request => `
                <li>${new Date(request.collectionDate).toLocaleDateString()} - Collection ${request.status} (${request.wasteType || 'General Waste'})</li>
            `).join('')
            }
        </ul>
    `;
}

async function showProfile() {
    try {
        const response = await fetch('userDetails.php');
        const user = await response.json();
        if (user.error) {
            alert('Error fetching profile: ' + user.error);
            return;
        }

    const profileHTML = `
        <div class="card">
            <h3>My Profile</h3>
            <div class="form-group">
                <label>Name</label>
                <p>${user.full_name}</p>
            </div>
            <div class="form-group">
                <label>Email</label>
                <p>${user.email}</p>
            </div>
            <div class="form-group">
                <label>Account Type</label>
                <p>${user.account_type}</p>
            </div>
            <div class="form-group">
                <label>Location</label>
                <p>${user.location}</p>
            </div>
            <div class="form-group">
                <label>Registration Date</label>
                <p></p>
            </div>
        </div>
    `;
    
    dashboardContent.innerHTML = profileHTML;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function showRequestCollection() {
    const { currentUser } = await fetchDashboardData();
    
    const requestCollectionHTML = `
        <div class="card">
            <h3>Request Waste Collection</h3>
            <form id="requestCollectionForm" method="post" action="requests.php">
                <div class="form-group">
                    <label for="wasteType">Waste Type</label>
                    <select id="wasteType" class="form-control" name="wasteType" required>
                        <option value="">Select Waste Type</option>
                        <option value="plastic">Plastic</option>
                        <option value="paper">Paper</option>
                        <option value="glass">Glass</option>
                        <option value="metal">Metal</option>
                        <option value="organic">Organic</option>
                        <option value="mixed">Mixed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="wasteWeight">Estimated Weight (kg)</label>
                    <input type="number" id="wasteWeight" class="form-control" name="weight" step="0.1" min="0" required>
                </div>
                <div class="form-group">
                    <label for="collectionAddress">Collection Address</label>
                    <input type="text" id="collectionAddress" name="collectionAddress" class="form-control" value="${currentUser.location}" required>
                </div>
                <div class="form-group">
                    <label for="preferredDate">Preferred Collection Date</label>
                    <input type="date" id="preferredDate" name="collectionDate" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="preferredTime">Preferred Time</label>
                    <select id="preferredTime" name="preferredTime" class="form-control" required>
                        <option value="">Select Time</option>
                        <option value="morning">Morning (8AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 4PM)</option>
                        <option value="evening">Evening (4PM - 7PM)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="specialInstructions">Special Instructions (Optional)</label>
                    <textarea id="specialInstructions" name="instruction" class="form-control" placeholder="Any special instructions for the collector..."></textarea>
                </div>
                <div class="form-group">
                    <label for="paymentMethod">Payment Method</label>
                    <select id="paymentMethod" name="paymentMethod" class="form-control" required>
                        <option value="">Select Payment Method</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="cash">Cash on Collection</option>
                        <option value="points">Reward Points</option>
                    </select>
                </div>
                <div id="costEstimate" style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; display: none;">
                    <h4>Cost Estimate</h4>
                    <p>Estimated Cost: KES <span id="estimatedCost">0</span></p>
                    <p>Service Fee: KES <span id="serviceFee">0</span></p>
                    <p><strong>Total: KES <span id="totalCost">0</span></strong></p>
                </div>
                <button type="submit" class="btn btn-primary">Submit Request</button>
            </form>
            <div id="requestResult" style="margin-top: 20px;"></div>
        </div>
    `;
    
    dashboardContent.innerHTML = requestCollectionHTML;
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('preferredDate').setAttribute('min', today);
    
    // Calculate cost when weight changes
    document.getElementById('wasteWeight').addEventListener('input', calculateCost);
    
    // document.getElementById('requestCollectionForm').addEventListener('submit', function(e) {
    //     e.preventDefault();
        
    //     const wasteType = document.getElementById('wasteType').value;
    //     const wasteWeight = parseFloat(document.getElementById('wasteWeight').value);
    //     const collectionAddress = document.getElementById('collectionAddress').value;
    //     const preferredDate = document.getElementById('preferredDate').value;
    //     const preferredTime = document.getElementById('preferredTime').value;
    //     const specialInstructions = document.getElementById('specialInstructions').value;
    //     const paymentMethod = document.getElementById('paymentMethod').value;
        
    //     const newRequest = {
    //         id: Date.now().toString(),
    //         userId: currentUser.id,
    //         userName: currentUser.name,
    //         userType: currentUser.type,
    //         userLocation: currentUser.location,
    //         wasteType: wasteType,
    //         wasteWeight: wasteWeight,
    //         collectionAddress: collectionAddress,
    //         preferredDate: preferredDate,
    //         preferredTime: preferredTime,
    //         specialInstructions: specialInstructions,
    //         paymentMethod: paymentMethod,
    //         status: 'pending',
    //         requestDate: new Date().toISOString(),
    //         estimatedCost: calculateTotalCost(wasteWeight)
    //     };
        
    //     collectionRequests.push(newRequest);
    //     localStorage.setItem('collectionRequests', JSON.stringify(collectionRequests));
        
    //     document.getElementById('requestResult').innerHTML = `
    //         <div class="card" style="background-color: #e8f5e9;">
    //             <h3>Request Submitted Successfully!</h3>
    //             <p>Your waste collection request has been received.</p>
    //             <p><strong>Request ID:</strong> ${newRequest.id}</p>
    //             <p><strong>Waste Type:</strong> ${wasteType}</p>
    //             <p><strong>Estimated Weight:</strong> ${wasteWeight} kg</p>
    //             <p><strong>Collection Address:</strong> ${collectionAddress}</p>
    //             <p><strong>Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
    //             <p><strong>Total Cost:</strong> KES ${newRequest.estimatedCost}</p>
    //             <p>You will be notified when a collector is assigned to your request.</p>
    //         </div>
    //     `;
        
    //     document.getElementById('requestCollectionForm').reset();
    //     document.getElementById('costEstimate').style.display = 'none';
        
    //     // Update statistics
    //     updateStatistics();
    // });
}

function calculateCost() {
    const weight = parseFloat(document.getElementById('wasteWeight').value) || 0;
    const costEstimate = document.getElementById('costEstimate');
    
    if (weight > 0) {
        const baseCost = weight * currentRate;
        const serviceFee = baseCost * 0.1; // 10% service fee
        const totalCost = baseCost + serviceFee;
        
        document.getElementById('estimatedCost').textContent = baseCost.toFixed(2);
        document.getElementById('serviceFee').textContent = serviceFee.toFixed(2);
        document.getElementById('totalCost').textContent = totalCost.toFixed(2);
        
        costEstimate.style.display = 'block';
    } else {
        costEstimate.style.display = 'none';
    }
}

// function calculateTotalCost(weight) {
//     const baseCost = weight * currentRate;
//     const serviceFee = baseCost * 0.1;
//     return baseCost + serviceFee;
// }

function showMyRequests() {
    const userRequests = collectionRequests.filter(r => r.userId === currentUser.id);
    
    const myRequestsHTML = `
        <div class="card">
            <h3>My Collection Requests</h3>
            ${userRequests.length === 0 ? 
                '<p>You have no collection requests yet.</p>' : 
                `
                <table>
                    <thead>
                        <tr>
                            <th>Request Date</th>
                            <th>Waste Type</th>
                            <th>Weight (kg)</th>
                            <th>Collection Date</th>
                            <th>Status</th>
                            <th>Cost (KES)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userRequests.map(request => `
                            <tr>
                                <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                                <td>${request.wasteType}</td>
                                <td>${request.wasteWeight}</td>
                                <td>${request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'N/A'}</td>
                                <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                                <td>${request.estimatedCost || 'N/A'}</td>
                                <td>
                                    ${request.status === 'pending' ? 
                                        `<button class="btn btn-danger btn-sm" onclick="cancelRequest('${request.id}')">Cancel</button>` : 
                                        ''
                                    }
                                    <button class="btn btn-info btn-sm" onclick="viewRequestDetails('${request.id}')">Details</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `
            }
        </div>
    `;
    
    dashboardContent.innerHTML = myRequestsHTML;
}

function cancelRequest(requestId) {
    if (confirm('Are you sure you want to cancel this collection request?')) {
        const requestIndex = collectionRequests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
            collectionRequests[requestIndex].status = 'cancelled';
            collectionRequests[requestIndex].cancelledDate = new Date().toISOString();
            localStorage.setItem('collectionRequests', JSON.stringify(collectionRequests));
            showMyRequests();
            updateStatistics();
        }
    }
}

function viewRequestDetails(requestId) {
    const request = collectionRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const detailsHTML = `
        <div class="card">
            <h3>Request Details</h3>
            <div class="form-group">
                <label>Request ID</label>
                <p>${request.id}</p>
            </div>
            <div class="form-group">
                <label>Waste Type</label>
                <p>${request.wasteType}</p>
            </div>
            <div class="form-group">
                <label>Weight</label>
                <p>${request.wasteWeight} kg</p>
            </div>
            <div class="form-group">
                <label>Collection Address</label>
                <p>${request.collectionAddress}</p>
            </div>
            <div class="form-group">
                <label>Preferred Date</label>
                <p>${new Date(request.preferredDate).toLocaleDateString()}</p>
            </div>
            <div class="form-group">
                <label>Preferred Time</label>
                <p>${request.preferredTime}</p>
            </div>
            <div class="form-group">
                <label>Special Instructions</label>
                <p>${request.specialInstructions || 'None'}</p>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <p>${request.paymentMethod}</p>
            </div>
            <div class="form-group">
                <label>Status</label>
                <p><span class="status-badge status-${request.status}">${request.status}</span></p>
            </div>
            <div class="form-group">
                <label>Estimated Cost</label>
                <p>KES ${request.estimatedCost || 'N/A'}</p>
            </div>
            ${request.collectorName ? `
                <div class="form-group">
                    <label>Assigned Collector</label>
                    <p>${request.collectorName}</p>
                </div>
            ` : ''}
            ${request.collectionDate ? `
                <div class="form-group">
                    <label>Collection Date</label>
                    <p>${new Date(request.collectionDate).toLocaleDateString()}</p>
                </div>
            ` : ''}
            <button class="btn btn-secondary" onclick="showMyRequests()">Back to My Requests</button>
        </div>
    `;
    
    dashboardContent.innerHTML = detailsHTML;
}

function showRewards() {
    const userPoints = rewardPoints[currentUser.id] || 0;
    const userRequests = collectionRequests.filter(r => 
        r.userId === currentUser.id && r.status === 'completed'
    );
    
    const rewardsHTML = `
        <div class="card">
            <h3>My Rewards</h3>
            <div class="reward-points">
                <h3>Your Reward Points</h3>
                <div class="points-value">${userPoints}</div>
                <p>Points can be redeemed for discounts on future collections</p>
            </div>
            
            <h4>How to Earn Points</h4>
            <ul>
                <li>+10 points for each completed collection</li>
                <li>+5 points for consistent weekly collections</li>
                <li>+20 points for proper waste segregation</li>
                <li>+50 points for referring a new user</li>
            </ul>
            
            <h4>Recent Points Activity</h4>
            ${userRequests.length === 0 ? 
                '<p>No completed collections yet. Complete your first collection to earn points!</p>' :
                `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Collection</th>
                            <th>Points Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userRequests.map(request => `
                            <tr>
                                <td>${new Date(request.collectionDate || request.requestDate).toLocaleDateString()}</td>
                                <td>${request.wasteType} (${request.wasteWeight}kg)</td>
                                <td>+10</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `
            }
            
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="showRequestCollection()">Request New Collection</button>
                <button class="btn btn-info" onclick="showReferral()">Refer a Friend</button>
            </div>
        </div>
    `;
    
    dashboardContent.innerHTML = rewardsHTML;
}

function showReferral() {
    const referralHTML = `
        <div class="card">
            <h3>Refer a Friend</h3>
            <p>Share your referral code with friends and earn 50 points when they sign up and complete their first collection!</p>
            
            <div class="form-group">
                <label>Your Referral Code</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="referralCode" class="form-control" value="REF-${currentUser.id.slice(-6)}" readonly>
                    <button class="btn btn-primary" onclick="copyReferralCode()">Copy</button>
                </div>
            </div>
            
            <div class="form-group">
                <label>Share via</label>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn btn-secondary">WhatsApp</button>
                    <button class="btn btn-secondary">Email</button>
                    <button class="btn btn-secondary">SMS</button>
                </div>
            </div>
            
            <button class="btn btn-secondary" onclick="showRewards()">Back to Rewards</button>
        </div>
    `;
    
    dashboardContent.innerHTML = referralHTML;
}

function copyReferralCode() {
    const referralCode = document.getElementById('referralCode');
    referralCode.select();
    document.execCommand('copy');
    alert('Referral code copied to clipboard!');
}

function showAvailableRequests() {

    
    const availableRequestsHTML = `
        <div class="card">
            <h3>Available Collection Requests</h3>
            ${availableRequests.length === 0 ? 
                '<p>No available collection requests in your area at the moment.</p>' : 
                `
                <table>
                    <thead>
                        <tr>
                            <th>Request Date</th>
                            <th>Customer</th>
                            <th>Waste Type</th>
                            <th>Weight (kg)</th>
                            <th>Location</th>
                            <th>Preferred Date</th>
                            <th>Estimated Earnings</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${availableRequests.map(request => `
                            <tr>
                                <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                                <td>${request.userName}</td>
                                <td>${request.wasteType}</td>
                                <td>${request.wasteWeight}</td>
                                <td>${request.collectionAddress}</td>
                                <td>${new Date(request.preferredDate).toLocaleDateString()}</td>
                                <td>KES ${(request.wasteWeight * currentRate * 0.7).toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm" onclick="acceptRequest('${request.id}')">Accept</button>
                                    <button class="btn btn-info btn-sm" onclick="viewRequestDetails('${request.id}')">Details</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `
            }
        </div>
    `;
    
    dashboardContent.innerHTML = availableRequestsHTML;
}

function acceptRequest(requestId) {
    if (confirm('Accept this collection request?')) {
        const requestIndex = collectionRequests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
            collectionRequests[requestIndex].status = 'in-progress';
            collectionRequests[requestIndex].collectorId = currentUser.id;
            collectionRequests[requestIndex].collectorName = currentUser.name;
            collectionRequests[requestIndex].acceptedDate = new Date().toISOString();
            localStorage.setItem('collectionRequests', JSON.stringify(collectionRequests));
            showAvailableRequests();
        }
    }
}

function showMyCollections() {
    const myCollections = collectionRequests.filter(r => r.collectorId === currentUser.id);
    
    const myCollectionsHTML = `
        <div class="card">
            <h3>My Collections</h3>
            ${myCollections.length === 0 ? 
                '<p>You have no assigned collections yet.</p>' : 
                `
                <table>
                    <thead>
                        <tr>
                            <th>Request Date</th>
                            <th>Customer</th>
                            <th>Waste Type</th>
                            <th>Weight (kg)</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Estimated Earnings</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myCollections.map(request => `
                            <tr>
                                <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                                <td>${request.userName}</td>
                                <td>${request.wasteType}</td>
                                <td>${request.wasteWeight}</td>
                                <td>${request.collectionAddress}</td>
                                <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                                <td>KES ${(request.wasteWeight * currentRate * 0.7).toFixed(2)}</td>
                                <td>
                                    ${request.status === 'in-progress' ? 
                                        `<button class="btn btn-primary btn-sm" onclick="completeCollection('${request.id}')">Complete</button>` : 
                                        ''
                                    }
                                    <button class="btn btn-info btn-sm" onclick="viewRequestDetails('${request.id}')">Details</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `
            }
        </div>
    `;
    
    dashboardContent.innerHTML = myCollectionsHTML;
}

function completeCollection(requestId) {
    if (confirm('Mark this collection as completed?')) {
        const requestIndex = collectionRequests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
            collectionRequests[requestIndex].status = 'completed';
            collectionRequests[requestIndex].collectionDate = new Date().toISOString();
            
            // Add to waste records
            const request = collectionRequests[requestIndex];
            const wasteRecord = {
                id: Date.now().toString(),
                requestId: request.id,
                userId: request.userId,
                userName: request.userName,
                collectorId: request.collectorId,
                collectorName: request.collectorName,
                wasteType: request.wasteType,
                weight: request.wasteWeight,
                collectionDate: new Date().toISOString(),
                status: 'collected',
                location: request.userLocation
            };
            
            wasteRecords.push(wasteRecord);
            
            // Award points to user
            if (rewardPoints[request.userId] === undefined) {
                rewardPoints[request.userId] = 0;
            }
            rewardPoints[request.userId] += 10;
            
            localStorage.setItem('collectionRequests', JSON.stringify(collectionRequests));
            localStorage.setItem('wasteRecords', JSON.stringify(wasteRecords));
            localStorage.setItem('rewardPoints', JSON.stringify(rewardPoints));
            
            showMyCollections();
            updateStatistics();
            
            alert('Collection marked as completed! User awarded 10 reward points.');
        }
    }
}

function updateStatistics() {
    // Update the statistics displayed on the main page
    usersCount.textContent = users.length;
    
    const totalWaste = wasteRecords.reduce((sum, record) => sum + record.weight, 0);
    wasteCollected.textContent = totalWaste;
    
    const recyclingRateValue = calculateRecyclingRate();
    recyclingRate.textContent = `${recyclingRateValue}%`;
    
    collectionRequestsCount.textContent = collectionRequests.length;
}

// Enhanced analytics function
function showAnalytics() {
    let analyticsHTML = '';
    
    if (currentUser.type === 'admin') {
        // Admin analytics
        const totalWaste = wasteRecords.reduce((sum, record) => sum + record.weight, 0);
        const plasticWaste = wasteRecords.filter(r => r.wasteType === 'plastic')
            .reduce((sum, record) => sum + record.weight, 0);
        const generalWaste = wasteRecords.filter(r => r.wasteType === 'general')
            .reduce((sum, record) => sum + record.weight, 0);
        const hazardousWaste = wasteRecords.filter(r => r.wasteType === 'hazardous')
            .reduce((sum, record) => sum + record.weight, 0);
        
        const completedRequests = collectionRequests.filter(r => r.status === 'completed').length;
        const pendingRequests = collectionRequests.filter(r => r.status === 'pending').length;
        const inProgressRequests = collectionRequests.filter(r => r.status === 'in-progress').length;
        
        const householdUsers = users.filter(u => u.type === 'household').length;
        const companyUsers = users.filter(u => u.type === 'company').length;
        const collectorUsers = users.filter(u => u.type === 'collector').length;
        
        analyticsHTML = `
            <div class="card">
                <h3>System Analytics Dashboard</h3>
                
                <div class="cards" style="margin-top: 20px;">
                    <div class="card">
                        <h4>Waste Collection Summary</h4>
                        <p>Total Waste Collected: <strong>${totalWaste} kg</strong></p>
                        <p>Plastic Waste: <strong>${plasticWaste} kg</strong></p>
                        <p>General Waste: <strong>${generalWaste} kg</strong></p>
                        <p>Hazardous Waste: <strong>${hazardousWaste} kg</strong></p>
                        <p>Recycling Rate: <strong>${calculateRecyclingRate()}%</strong></p>
                    </div>
                    
                    <div class="card">
                        <h4>Collection Requests</h4>
                        <p>Completed: <strong>${completedRequests}</strong></p>
                        <p>In Progress: <strong>${inProgressRequests}</strong></p>
                        <p>Pending: <strong>${pendingRequests}</strong></p>
                        <p>Total Requests: <strong>${collectionRequests.length}</strong></p>
                    </div>
                    
                    <div class="card">
                        <h4>User Statistics</h4>
                        <p>Household Users: <strong>${householdUsers}</strong></p>
                        <p>Company Users: <strong>${companyUsers}</strong></p>
                        <p>Collectors: <strong>${collectorUsers}</strong></p>
                        <p>Total Users: <strong>${users.length}</strong></p>
                    </div>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>Monthly Collection Trends</h4>
                    <div id="monthlyChart" style="height: 300px; background: #f5f5f5; border-radius: 8px; padding: 20px;">
                        <p style="text-align: center; margin-top: 130px;">Monthly collection chart would be displayed here</p>
                    </div>
                </div>
                
                <div class="card" style="margin-top: 20px;">
                    <h4>Waste Type Distribution</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: #4caf50; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${totalWaste > 0 ? Math.round((plasticWaste/totalWaste)*100) : 0}%
                            </div>
                            <p>Plastic Waste</p>
                        </div>
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: #2196f3; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${totalWaste > 0 ? Math.round((generalWaste/totalWaste)*100) : 0}%
                            </div>
                            <p>General Waste</p>
                        </div>
                        <div style="text-align: center;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: #ff9800; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${totalWaste > 0 ? Math.round((hazardousWaste/totalWaste)*100) : 0}%
                            </div>
                            <p>Hazardous Waste</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else if (currentUser.type === 'recycler') {
        // Recycler analytics
        const myCollections = wasteRecords.filter(r => r.recyclerId === currentUser.id);
        const totalCollected = myCollections.reduce((sum, record) => sum + record.weight, 0);
        const plasticCollected = myCollections.filter(r => r.wasteType === 'plastic')
            .reduce((sum, record) => sum + record.weight, 0);
        const generalCollected = myCollections.filter(r => r.wasteType === 'general')
            .reduce((sum, record) => sum + record.weight, 0);
        const hazardousCollected = myCollections.filter(r => r.wasteType === 'hazardous')
            .reduce((sum, record) => sum + record.weight, 0);
        
        analyticsHTML = `
            <div class="card">
                <h3>Recycling Analytics</h3>
                
                <div class="cards" style="margin-top: 20px;">
                    <div class="card">
                        <h4>Total Waste Processed</h4>
                        <p style="font-size: 2rem; font-weight: bold; color: var(--primary); text-align: center;">
                            ${totalCollected} kg
                        </p>
                    </div>
                    
                    <div class="card">
                        <h4>Waste by Type</h4>
                        <p>Plastic: <strong>${plasticCollected} kg</strong></p>
                        <p>General: <strong>${generalCollected} kg</strong></p>
                        <p>Hazardous: <strong>${hazardousCollected} kg</strong></p>
                    </div>
                    
                    <div class="card">
                        <h4>Collection Efficiency</h4>
                        <p>Average Collection Size: <strong>${myCollections.length > 0 ? (totalCollected/myCollections.length).toFixed(1) : 0} kg</strong></p>
                        <p>Collections This Month: <strong>${myCollections.filter(r => {
                            const recordDate = new Date(r.collectionDate);
                            const now = new Date();
                            return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
                        }).length}</strong></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    dashboardContent.innerHTML = analyticsHTML;
}

// Update the request collection form with new waste types
function showRequestCollection() {
    const requestCollectionHTML = `
        <div class="card">
            <h3>Request Waste Collection</h3>
            <form id="requestCollectionForm">
                <div class="form-group">
                    <label for="wasteType">Waste Type</label>
                    <select id="wasteType" class="form-control" required>
                        <option value="">Select Waste Type</option>
                        <option value="plastic">Plastic Waste</option>
                        <option value="general">General Waste</option>
                        <option value="hazardous">Hazardous Waste</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="wasteWeight">Estimated Weight (kg)</label>
                    <input type="number" id="wasteWeight" class="form-control" step="0.1" min="0" required>
                </div>
                <div class="form-group">
                    <label for="collectionAddress">Collection Address</label>
                    <input type="text" id="collectionAddress" class="form-control" value="${currentUser.location}" required>
                </div>
                <div class="form-group">
                    <label for="preferredDate">Preferred Collection Date</label>
                    <input type="date" id="preferredDate" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="preferredTime">Preferred Time</label>
                    <select id="preferredTime" class="form-control" required>
                        <option value="">Select Time</option>
                        <option value="morning">Morning (8AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 4PM)</option>
                        <option value="evening">Evening (4PM - 7PM)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="specialInstructions">Special Instructions (Optional)</label>
                    <textarea id="specialInstructions" class="form-control" placeholder="Any special instructions for the collector..."></textarea>
                </div>
                <div class="form-group">
                    <label for="paymentMethod">Payment Method</label>
                    <select id="paymentMethod" class="form-control" required>
                        <option value="">Select Payment Method</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="cash">Cash on Collection</option>
                        <option value="points">Reward Points</option>
                    </select>
                </div>
                <div id="costEstimate" style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; display: none;">
                    <h4>Cost Estimate</h4>
                    <p>Estimated Cost: KES <span id="estimatedCost">0</span></p>
                    <p>Service Fee: KES <span id="serviceFee">0</span></p>
                    <p><strong>Total: KES <span id="totalCost">0</span></strong></p>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
                        * You will earn <strong id="pointsEarned">0</strong> reward points for this collection
                    </p>
                </div>
                <button type="submit" class="btn btn-primary">Submit Request</button>
            </form>
            <div id="requestResult" style="margin-top: 20px;"></div>
        </div>
    `;
    
    dashboardContent.innerHTML = requestCollectionHTML;
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('preferredDate').setAttribute('min', today);
    
    // Calculate cost when weight changes
    document.getElementById('wasteWeight').addEventListener('input', calculateCost);
    
    document.getElementById('requestCollectionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const wasteType = document.getElementById('wasteType').value;
        const wasteWeight = parseFloat(document.getElementById('wasteWeight').value);
        const collectionAddress = document.getElementById('collectionAddress').value;
        const preferredDate = document.getElementById('preferredDate').value;
        const preferredTime = document.getElementById('preferredTime').value;
        const specialInstructions = document.getElementById('specialInstructions').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        const newRequest = {
            id: Date.now().toString(),
            userId: currentUser.id,
            userName: currentUser.name,
            userType: currentUser.type,
            userLocation: currentUser.location,
            wasteType: wasteType,
            wasteWeight: wasteWeight,
            collectionAddress: collectionAddress,
            preferredDate: preferredDate,
            preferredTime: preferredTime,
            specialInstructions: specialInstructions,
            paymentMethod: paymentMethod,
            status: 'pending',
            requestDate: new Date().toISOString(),
            estimatedCost: calculateTotalCost(wasteWeight),
            pointsEarned: calculatePoints(wasteType, wasteWeight)
        };
        
        collectionRequests.push(newRequest);
        localStorage.setItem('collectionRequests', JSON.stringify(collectionRequests));
        
        document.getElementById('requestResult').innerHTML = `
            <div class="card" style="background-color: #e8f5e9;">
                <h3>Request Submitted Successfully!</h3>
                <p>Your waste collection request has been received.</p>
                <p><strong>Request ID:</strong> ${newRequest.id}</p>
                <p><strong>Waste Type:</strong> ${wasteType}</p>
                <p><strong>Estimated Weight:</strong> ${wasteWeight} kg</p>
                <p><strong>Collection Address:</strong> ${collectionAddress}</p>
                <p><strong>Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
                <p><strong>Total Cost:</strong> KES ${newRequest.estimatedCost}</p>
                <p><strong>Points to Earn:</strong> ${newRequest.pointsEarned} points</p>
                <p>You will be notified when a collector is assigned to your request.</p>
            </div>
        `;
        
        document.getElementById('requestCollectionForm').reset();
        document.getElementById('costEstimate').style.display = 'none';
        
        // Update statistics
        updateStatistics();
    });
}

// Update cost calculation to show points
function calculateCost() {
    const weight = parseFloat(document.getElementById('wasteWeight').value) || 0;
    const wasteType = document.getElementById('wasteType').value;
    const costEstimate = document.getElementById('costEstimate');
    
    if (weight > 0 && wasteType) {
        const baseCost = weight * currentRate;
        const serviceFee = baseCost * 0.1; // 10% service fee
        const totalCost = baseCost + serviceFee;
        const points = calculatePoints(wasteType, weight);
        
        document.getElementById('estimatedCost').textContent = baseCost.toFixed(2);
        document.getElementById('serviceFee').textContent = serviceFee.toFixed(2);
        document.getElementById('totalCost').textContent = totalCost.toFixed(2);
        document.getElementById('pointsEarned').textContent = points;
        
        costEstimate.style.display = 'block';
    } else {
        costEstimate.style.display = 'none';
    }
}

// Calculate points based on waste type and weight
function calculatePoints(wasteType, weight) {
    let basePoints = Math.floor(weight); // 1 point per kg
    
    // Bonus points based on waste type
    switch(wasteType) {
        case 'plastic':
            basePoints += 5; // Extra points for plastic recycling
            break;
        case 'hazardous':
            basePoints += 10; // Extra points for proper hazardous waste disposal
            break;
        case 'general':
            basePoints += 2; // Standard points for general waste
            break;
    }
    
    // Minimum points guarantee
    return Math.max(basePoints, 5);
}

// Update the completeCollection function to award points immediately
function completeCollection(requestId) {
    if (confirm('Mark this collection as completed?')) {
        const requestIndex = collectionRequests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
            collectionRequests[requestIndex].status = 'completed';
            collectionRequests[requestIndex].collectionDate = new Date().toISOString();
            
            // Add to waste records
            const request = collectionRequests[requestIndex];
            const wasteRecord = {
                id: Date.now().toString(),
                requestId: request.id,
                userId: request.userId,
                userName: request.userName,
                collectorId: request.collectorId,
                collectorName: request.collectorName,
                wasteType: request.wasteType,
                weight: request.wasteWeight,
                collectionDate: new Date().toISOString(),
                status: 'collected',
                location: request.userLocation
            };
            
            wasteRecords.push(wasteRecord);
            
            // Award points to user immediately after collection
            if (rewardPoints[request.userId] === undefined) {
                rewardPoints[request.userId] = 0;
            }
            
            const pointsEarned = calculatePoints(request.wasteType, request.wasteWeight);
            rewardPoints[request.userId] += pointsEarned;
            
            localStorage.setItem('collectionRequests', JSON.stringify(collectionRequests));
            localStorage.setItem('wasteRecords', JSON.stringify(wasteRecords));
            localStorage.setItem('rewardPoints', JSON.stringify(rewardPoints));
            
            showMyCollections();
            updateStatistics();
            
            alert(`Collection marked as completed! User awarded ${pointsEarned} reward points.`);
        }
    }
}

// Update the rewards display to show actual points from completed requests
function showRewards() {
    const userPoints = rewardPoints[currentUser.id] || 0;
    const userRequests = collectionRequests.filter(r => 
        r.userId === currentUser.id && r.status === 'completed'
    );
    
    // Calculate total points earned from all completed requests
    const totalPointsEarned = userRequests.reduce((total, request) => {
        return total + (request.pointsEarned || calculatePoints(request.wasteType, request.wasteWeight));
    }, 0);
    
    const rewardsHTML = `
        <div class="card">
            <h3>My Rewards</h3>
            <div class="reward-points">
                <h3>Your Reward Points</h3>
                <div class="points-value">${userPoints}</div>
                <p>Points can be redeemed for discounts on future collections</p>
            </div>
            
            <h4>Points Breakdown</h4>
            <div class="cards" style="margin-top: 10px;">
                <div class="card">
                    <h5>Points Earned</h5>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--secondary);">${totalPointsEarned}</p>
                    <p>Total points from all collections</p>
                </div>
                <div class="card">
                    <h5>Points Used</h5>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--warning);">${totalPointsEarned - userPoints}</p>
                    <p>Points redeemed for discounts</p>
                </div>
                <div class="card">
                    <h5>Available Points</h5>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">${userPoints}</p>
                    <p>Points ready to use</p>
                </div>
            </div>
            
            <h4>How to Earn Points</h4>
            <div class="cards" style="margin-top: 10px;">
                <div class="card">
                    <h5>Plastic Waste</h5>
                    <p><strong>5 + 1 point per kg</strong></p>
                    <p>Bonus for recycling plastic</p>
                </div>
                <div class="card">
                    <h5>Hazardous Waste</h5>
                    <p><strong>10 + 1 point per kg</strong></p>
                    <p>Bonus for safe disposal</p>
                </div>
                <div class="card">
                    <h5>General Waste</h5>
                    <p><strong>2 + 1 point per kg</strong></p>
                    <p>Standard collection</p>
                </div>
            </div>
            
            <h4>Recent Points Activity</h4>
            ${userRequests.length === 0 ? 
                '<p>No completed collections yet. Complete your first collection to earn points!</p>' :
                `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Collection</th>
                            <th>Weight</th>
                            <th>Points Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${userRequests.map(request => `
                            <tr>
                                <td>${new Date(request.collectionDate || request.requestDate).toLocaleDateString()}</td>
                                <td>${request.wasteType}</td>
                                <td>${request.wasteWeight}kg</td>
                                <td style="color: var(--secondary); font-weight: bold;">
                                    +${request.pointsEarned || calculatePoints(request.wasteType, request.wasteWeight)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `
            }
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="showRequestCollection()">Request New Collection</button>
                <button class="btn btn-info" onclick="showReferral()">Refer a Friend</button>
                <button class="btn btn-warning" onclick="redeemPoints()">Redeem Points</button>
            </div>
        </div>
    `;
    
    dashboardContent.innerHTML = rewardsHTML;
}

// Add points redemption function
function redeemPoints() {
    const userPoints = rewardPoints[currentUser.id] || 0;
    
    if (userPoints < 50) {
        alert('You need at least 50 points to redeem rewards.');
        return;
    }
    
    const redemptionHTML = `
        <div class="card">
            <h3>Redeem Reward Points</h3>
            <p>Your available points: <strong>${userPoints}</strong></p>
            
            <div class="cards" style="margin-top: 20px;">
                <div class="card" style="text-align: center;">
                    <h4>50 Points</h4>
                    <p>KES 50 discount</p>
                    <button class="btn btn-primary" onclick="processRedemption(50, 50)">Redeem</button>
                </div>
                <div class="card" style="text-align: center;">
                    <h4>100 Points</h4>
                    <p>KES 120 discount</p>
                    <button class="btn btn-primary" onclick="processRedemption(100, 120)">Redeem</button>
                </div>
                <div class="card" style="text-align: center;">
                    <h4>200 Points</h4>
                    <p>KES 250 discount</p>
                    <button class="btn btn-primary" onclick="processRedemption(200, 250)">Redeem</button>
                </div>
            </div>
            
            <button class="btn btn-secondary" onclick="showRewards()" style="margin-top: 20px;">Back to Rewards</button>
        </div>
    `;
    
    dashboardContent.innerHTML = redemptionHTML;
}

function processRedemption(pointsCost, discountAmount) {
    const userPoints = rewardPoints[currentUser.id] || 0;
    
    if (userPoints < pointsCost) {
        alert(`You don't have enough points. You need ${pointsCost} points but only have ${userPoints}.`);
        return;
    }
    
    if (confirm(`Redeem ${pointsCost} points for KES ${discountAmount} discount on your next collection?`)) {
        rewardPoints[currentUser.id] -= pointsCost;
        localStorage.setItem('rewardPoints', JSON.stringify(rewardPoints));
        
        alert(`Success! You've redeemed ${pointsCost} points for a KES ${discountAmount} discount voucher.`);
        showRewards();
    }
}