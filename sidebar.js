/* Sidebar dropdown code */
let sidebarLists = document.querySelectorAll(".sidebar_list");

sidebarLists.forEach((list) => {
    let dropdown = list.querySelector(".sidebar_dropdown");
    let arrow = list.querySelector(".sidebar_dropdown_arrow");

    if (dropdown) {
        list.addEventListener("click", () => {
            list.classList.toggle("active");

            // Toggle the arrow direction if present
            if (arrow) {
                arrow.classList.toggle("fa-chevron-down");
                arrow.classList.toggle("fa-chevron-up");
            }
        });
    }
});



let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebar_toggle");

// Function to update sidebar state in localStorage
function updateSidebarState() {
    if (sidebar.classList.contains("close")) {
        localStorage.setItem("sidebarState", "closed");
        sidebarBtn.classList.add("fa-chevron-right");
        sidebarBtn.classList.remove("fa-chevron-left");
    } else {
        localStorage.setItem("sidebarState", "open");
        sidebarBtn.classList.add("fa-chevron-left");
        sidebarBtn.classList.remove("fa-chevron-right");
    }
}

// Check localStorage on page load and apply the sidebar state
document.addEventListener("DOMContentLoaded", () => {
    let savedState = localStorage.getItem("sidebarState");

    if (savedState === "closed") {
        sidebar.classList.add("close");
        sidebarBtn.classList.add("fa-chevron-right");
        sidebarBtn.classList.remove("fa-chevron-left");
    } else {
        sidebar.classList.remove("close");
        sidebarBtn.classList.add("fa-chevron-left");
        sidebarBtn.classList.remove("fa-chevron-right");
    }
});

// Toggle sidebar and update localStorage when clicked
sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    updateSidebarState();
});
