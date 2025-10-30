/* Sidebar dropdown code */
let sidebarLists = document.querySelectorAll(".sidebar_list");

sidebarLists.forEach((list) => {
    let dropdown = list.querySelector(".sidebar_dropdown");
    let arrow = list.querySelector(".sidebar_dropdown_arrow");

    if (dropdown) {
        dropdown.addEventListener("click", () => {
            list.classList.toggle("active");
            arrow.classList.toggle("fa-chevron-down");
            arrow.classList.toggle("fa-chevron-up");            
        });
    }
});

// Open and close the sidebar (including on smaller screens)
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebar_toggle");
let overlay = document.querySelector(".mob-overlay");

function openSidebar() {
    sidebar.classList.remove("close");
    sidebar.classList.add("open");
    sidebarBtn.classList.add("fa-xmark");
    sidebarBtn.classList.remove("fa-bars");
}

// Function to update sidebar state in localStorage
function updateSidebarState() {
    if (sidebar.classList.contains("close")) {
        // localStorage.setItem("sidebarState", "closed");
        sidebarBtn.classList.add("fa-bars");
        sidebarBtn.classList.remove("fa-xmark");
    } else {
        // localStorage.setItem("sidebarState", "open");
        sidebarBtn.classList.add("fa-xmark");
        sidebarBtn.classList.remove("fa-bars");
    }
}

// Check localStorage on page load and apply the sidebar state
document.addEventListener("DOMContentLoaded", () => {
    let savedState = localStorage.getItem("sidebarState");
    const isSmallScreen = window.innerWidth <= 1200;

    if (isSmallScreen) {
        // Always start closed on small screens
        sidebar.classList.add("close");
        sidebar.classList.remove("open");
    } else {
        if (savedState === "closed") {
            sidebar.classList.add("close");
            sidebar.classList.remove("open");
            sidebarBtn.classList.add("fa-bars");
            sidebarBtn.classList.remove("fa-xmark");
        } else {        
            openSidebar();
        }
    }
});

function sidebarToggle() {
    sidebar.classList.toggle("close");
    sidebar.classList.toggle("open");
    updateSidebarState();
}

// Toggle sidebar and update localStorage when clicked
sidebarBtn.addEventListener("click", () => {
    sidebarToggle();
});

overlay.addEventListener("click", () => {
    sidebarToggle();
});