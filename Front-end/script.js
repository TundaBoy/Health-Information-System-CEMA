const API_BASE_URL = 'http://localhost:5000/api';

// Toggle sidebar 
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// Authentication
document.addEventListener("DOMContentLoaded", function() {
    // Login Form
    const loginForm = document.querySelector(".container-login form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const messageBox = document.getElementById("login-message");

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    messageBox.textContent = "Login successful! Redirecting...";
                    messageBox.className = "message success";
                    localStorage.setItem("currentUser", JSON.stringify(data.user));
                    setTimeout(() => window.location.href = "index.html", 1500);
                } else {
                    messageBox.textContent = data.error || "Invalid credentials";
                    messageBox.className = "message error";
                }
            } catch (error) {
                messageBox.textContent = "Network error. Please try again.";
                messageBox.className = "message error";
            }
        });
    }

    // Registration Form
    const registerForm = document.querySelector(".container-register form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const department = document.getElementById("department").value.trim();
            const messageBox = document.getElementById("register-message");

            try {
                
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, department })
                });

                const data = await response.json();

                if (response.ok) {
                    messageBox.textContent = "Registration successful! Redirecting to login...";
                    messageBox.className = "message success";
                    setTimeout(() => window.location.href = "login.html", 1500);
                } else {
                    messageBox.textContent = data.error || "Registration failed";
                    messageBox.className = "message error";
                }
            } catch (error) {
                messageBox.textContent = "Network error. Please try again.";
                messageBox.className = "message error";
            }
        });
    }
});

// Client Registration
document.addEventListener("DOMContentLoaded", function() {
    const clientForm = document.getElementById("client-form");
    if (clientForm) {
        clientForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const messageBox = document.getElementById("client-message");
            
            const clientData = {
                name: document.getElementById("client-name").value.trim(),
                age: document.getElementById("client-age").value.trim(),
                gender: document.getElementById("client-gender").value,
                phone: document.getElementById("client-phone").value.trim()
            };

            try {
                const response = await fetch(`${API_BASE_URL}/clients`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(clientData)
                });

                const data = await response.json();

                if (response.ok) {
                    messageBox.textContent = "Client registered successfully! Redirecting...";
                    messageBox.className = "message success";
                    
                    // Store the new client ID for auto-selection in enrollment
                    localStorage.setItem('newClientId', data.client.id);
                    
                    // Check programs and redirect appropriately
                    const programsResponse = await fetch(`${API_BASE_URL}/programs`);
                    const programs = await programsResponse.json();

                    setTimeout(() => {
                        window.location.href = programs.length > 0 
                            ? "enroll-client.html" 
                            : "create-program.html";
                    }, 1500);
                } else {
                    messageBox.textContent = data.error || "Failed to register client";
                    messageBox.className = "message error";
                }
            } catch (error) {
                messageBox.textContent = "Network error. Please try again.";
                messageBox.className = "message error";
            }
        });
    }
});

// Creating Program
document.addEventListener("DOMContentLoaded", function() {
    const programForm = document.getElementById("program-form");
    if (programForm) {
        programForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const messageBox = document.getElementById("program-message");
            
            const programData = {
                name: document.getElementById("program-name").value.trim(),
                description: document.getElementById("program-description").value.trim()
            };

            try {
                const response = await fetch(`${API_BASE_URL}/programs`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(programData)
                });

                const data = await response.json();

                if (response.ok) {
                    messageBox.textContent = "Program created successfully!";
                    messageBox.className = "message success";
                    programForm.reset();
                } else {
                    messageBox.textContent = data.error || "Failed to create program";
                    messageBox.className = "message error";
                }
            } catch (error) {
                messageBox.textContent = "Network error. Please try again.";
                messageBox.className = "message error";
            }
        });
    }
});

// Client Enrollment
document.addEventListener("DOMContentLoaded", async function() {
    const enrollForm = document.getElementById("enroll-form");
    if (enrollForm) {
        const clientSelect = document.getElementById("client-select");
        const programSelect = document.getElementById("program-select");
        const messageBox = document.getElementById("enroll-message");

        // Load clients and programs
        try {
            const [clientsRes, programsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/clients`),
                fetch(`${API_BASE_URL}/programs`)
            ]);

            const clients = await clientsRes.json();
            const programs = await programsRes.json();

            // Populate client dropdown
            clientSelect.innerHTML = '<option value="">-- Select Client --</option>';
            clients.forEach(client => {
                const option = document.createElement("option");
                option.value = client.id;
                option.textContent = client.name;
                clientSelect.appendChild(option);
            });

            // Auto-select newly registered client if available
            const newClientId = localStorage.getItem('newClientId');
            if (newClientId && clients.some(c => c.id == newClientId)) {
                clientSelect.value = newClientId;
                localStorage.removeItem('newClientId');
            }

            // Populate program dropdown
            programSelect.innerHTML = '<option value="">-- Select Program --</option>';
            programs.forEach(program => {
                const option = document.createElement("option");
                option.value = program.id;
                option.textContent = program.name;
                programSelect.appendChild(option);
            });

        } catch (error) {
            messageBox.textContent = "Failed to load enrollment data";
            messageBox.className = "message error";
        }

        // Handle enrollment submission
        enrollForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const clientId = clientSelect.value;
            const programId = programSelect.value;

            if (!clientId || !programId) {
                messageBox.textContent = "Please select both client and program";
                messageBox.className = "message error";
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/enrollments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        client_id: parseInt(clientId),
                        program_id: parseInt(programId)
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    messageBox.textContent = "Enrollment successful! Redirecting...";
                    messageBox.className = "message success";
                    setTimeout(() => window.location.href = "index.html", 1500);
                } else {
                    messageBox.textContent = data.error || "Enrollment failed";
                    messageBox.className = "message error";
                }
            } catch (error) {
                messageBox.textContent = "Network error. Please try again.";
                messageBox.className = "message error";
            }
        });
    }
});

// Client Searching
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("search-client-input");
    const searchButton = document.getElementById("search-client-btn");
    const searchResults = document.getElementById("search-results");

    if (searchInput && searchButton) {
        const performSearch = async () => {
            const query = searchInput.value.trim().toLowerCase();
            searchResults.innerHTML = "";

            if (!query) return;

            try {
                const response = await fetch(`${API_BASE_URL}/clients?q=${encodeURIComponent(query)}`);
                const clients = await response.json();

                if (clients.length > 0) {
                    clients.forEach(client => {
                        const div = document.createElement("div");
                        div.textContent = client.name;
                        div.className = "client-result";
                        div.addEventListener("click", () => {
                            localStorage.setItem("selectedClient", JSON.stringify(client));
                            window.location.href = "profile.html";
                        });
                        searchResults.appendChild(div);
                    });
                } else {
                    searchResults.innerHTML = '<div class="not-found">Client not found</div>';
                }
            } catch (error) {
                searchResults.innerHTML = '<div class="not-found">Search failed</div>';
            }
        };

        searchInput.addEventListener("input", performSearch);
        searchButton.addEventListener("click", performSearch);
    }
});
// Profile Handling
document.addEventListener("DOMContentLoaded", async function() {
    const profileContainer = document.getElementById("profile-details");
    if (!profileContainer) return;
    
    const selectedClient = JSON.parse(localStorage.getItem("selectedClient"));
    
    if (!selectedClient || !selectedClient.id) {
        profileContainer.innerHTML = `
            <div class="profile-error">
                <p>No client selected</p>
                <a href="search-client.html">Search for a client</a>
            </div>
        `;
        return;
    }

    try {
        // Show loading state
        profileContainer.innerHTML = `
            <div class="profile-loading">
                <p>Loading client data...</p>
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // Fetch both client details and enrollments in parallel
        const [clientResponse, enrollmentsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/clients/${selectedClient.id}`),
            fetch(`${API_BASE_URL}/clients/${selectedClient.id}/enrollments`)
        ]);

        // Check for errors
        if (!clientResponse.ok) {
            throw new Error(`Failed to load client: ${clientResponse.status}`);
        }
        if (!enrollmentsResponse.ok) {
            throw new Error(`Failed to load enrollments: ${enrollmentsResponse.status}`);
        }
        
        const client = await clientResponse.json();
        const enrollments = await enrollmentsResponse.json();

        // Format enrollments
        let programsHtml = '<p class="no-programs">Not enrolled in any programs</p>';
        if (enrollments.length > 0) {
            programsHtml = `
                <ul class="enrollment-list">
                    ${enrollments.map(enroll => `
                        <li>
                            <strong>${enroll.program.name}</strong>
                            <span>Enrolled on: ${new Date(enroll.enrolled_at).toLocaleDateString()}</span>
                        </li>
                    `).join('')}
                </ul>
            `;
        }

        // Update profile display
        profileContainer.innerHTML = `
            <div class="client-info">
                <div class="info-row">
                    <span class="info-label">Client ID:</span>
                    <span class="info-value">${client.id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${client.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Age:</span>
                    <span class="info-value">${client.age || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Gender:</span>
                    <span class="info-value">${client.gender || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${client.phone || 'N/A'}</span>
                </div>
            </div>
            <div class="enrollments-section">
                <h3>Program Enrollments</h3>
                ${programsHtml}
            </div>
        `;

    } catch (error) {
        console.error("Profile loading error:", error);
        profileContainer.innerHTML = `
            <div class="profile-error">
                <p>Failed to load profile data</p>
                <p class="error-detail">${error.message}</p>
                <button class="retry-button" onclick="window.location.reload()">
                    Retry
                </button>
                <a href="index.html" class="back-link">Return to Dashboard</a>
            </div>
        `;
    }
});
//logout
document.addEventListener("DOMContentLoaded", function() {
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });
    }
});
  
  
  
  
    

  