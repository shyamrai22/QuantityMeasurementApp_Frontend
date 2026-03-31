const API_BASE = "http://localhost:5000/api";

const ALLOWED_UNITS = {
    Length: ["INCH", "FEET", "YARD", "CENTIMETER"],
    Volume: ["GALLON", "LITRE", "MILLILITRE"],
    Weight: ["GRAM", "KILOGRAM", "POUND"],
    Temperature: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
};

let currentType = "Length";
let currentUser = null;
let currentToken = null;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    populateUnits();
});

// Toast system
function showToast(msg, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    if (isError) {
        toast.classList.add("error");
        toast.classList.remove("success");
    } else {
        toast.classList.add("success");
        toast.classList.remove("error");
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

// State & Navigation
function changeMeasurementType(type) {
    currentType = type;
    document.querySelectorAll(".type-option").forEach(el => el.classList.remove("active"));
    document.querySelector(`[data-type="${type}"]`).classList.add("active");
    populateUnits();
    
    // reset fields
    document.querySelectorAll("input[type=number]").forEach(el => el.value = "");
    document.getElementById("convResultText").textContent = "Result will appear here";
    document.getElementById("mathResultText").textContent = "Result will appear here";
    document.getElementById("compResultText").textContent = "Result will appear here";
}

function populateUnits() {
    const units = ALLOWED_UNITS[currentType];
    const selectors = ["convFromUnit", "convToUnit", "mathUnit1", "mathUnit2", "compUnit1", "compUnit2"];
    
    selectors.forEach(id => {
        const sel = document.getElementById(id);
        if(!sel) return;
        sel.innerHTML = "";
        units.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u;
            opt.textContent = u;
            sel.appendChild(opt);
        });
    });
}

// Authentication
function checkAuth() {
    const token = localStorage.getItem("qm_token");
    const user = localStorage.getItem("qm_user");
    if (token && user) {
        currentToken = token;
        currentUser = user;
        document.getElementById("loggedOutState").classList.add("hidden");
        document.getElementById("loggedInState").classList.remove("hidden");
        document.getElementById("userNameDisplay").textContent = user;
    }
}

function toggleAuthModal() {
    document.getElementById("authModal").classList.toggle("hidden");
}

function switchAuthTab(tab) {
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".auth-form").forEach(el => el.classList.add("hidden"));
    if(tab === 'login') {
        document.getElementById("loginForm").classList.remove("hidden");
        document.querySelectorAll(".tab-btn")[0].classList.add("active");
    } else {
        document.getElementById("registerForm").classList.remove("hidden");
        document.querySelectorAll(".tab-btn")[1].classList.add("active");
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById("loginEmail").value;
    const p = document.getElementById("loginPassword").value;
    
    try {
        const res = await fetch(`${API_BASE}/Auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Email: u, Password: p })
        });
        
        let data;
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = { message: text }; }
        
        if (res.ok) {
            localStorage.setItem("qm_token", data.token);
            localStorage.setItem("qm_user", u);
            checkAuth();
            toggleAuthModal();
            showToast("Logged in successfully");
        } else {
            showToast(data.message || "Invalid credentials", true);
        }
    } catch(err) {
        showToast("Error connecting to server", true);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const u = document.getElementById("registerEmail").value;
    const p = document.getElementById("registerPassword").value;
    const cp = document.getElementById("registerConfirmPassword").value;
    
    try {
        const res = await fetch(`${API_BASE}/Auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Email: u, Password: p, ConfirmPassword: cp })
        });
        
        if (res.ok) {
            const resultMsg = await res.text();
            showToast(resultMsg || "Registration successful");
            switchAuthTab('login');
            document.getElementById("loginEmail").value = u;
        } else {
            const errorText = await res.text();
            showToast(errorText, true);
        }
    } catch(err) {
        showToast("Error connecting to server", true);
    }
}

function logout() {
    localStorage.removeItem("qm_token");
    localStorage.removeItem("qm_user");
    currentToken = null;
    currentUser = null;
    document.getElementById("loggedOutState").classList.remove("hidden");
    document.getElementById("loggedInState").classList.add("hidden");
    showToast("Logged out");
    if(!document.getElementById("recordsPane").classList.contains("hidden")) {
        document.getElementById("recordsTbody").innerHTML = '<tr><td colspan="5" class="text-center py-2">Please login to view history records.</td></tr>';
    }
}


function buildReqHeaders() {
    const h = { "Content-Type": "application/json" };
    if (currentToken) h["Authorization"] = `Bearer ${currentToken}`;
    return h;
}


