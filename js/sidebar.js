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

let overlay = document.querySelector(".mob-overlay");


function openSidebar() {
    sidebar.classList.remove("close");
    sidebar.classList.add("open");
    sidebarBtn.classList.add("fa-xmark");
    sidebarBtn.classList.remove("fa-bars");
}


// // Check localStorage on page load and apply the sidebar state
// document.addEventListener("DOMContentLoaded", () => {
//    let savedState = localStorage.getItem("sidebarState");

//     if (savedState === "closed") {
//         sidebar.classList.add("close");
//         sidebar.classList.remove("open");
//         sidebarBtn.classList.add("fa-bars");
//         sidebarBtn.classList.remove("fa-xmark");
//     } else {        
//         openSidebar();
//         }
// });

// // Function to update sidebar state in localStorage
// function updateSidebarState() {
//     if (sidebar.classList.contains("close")) {
//         localStorage.setItem("sidebarState", "closed");
//         sidebarBtn.classList.add("fa-bars");
//         sidebarBtn.classList.remove("fa-xmark");
//     } else {
//         localStorage.setItem("sidebarState", "open");
//         sidebarBtn.classList.add("fa-xmark");
//         sidebarBtn.classList.remove("fa-bars");
//     }
// }

function toggle() {
    
    sidebar.classList.toggle("close");
    sidebar.classList.toggle("open");
    updateSidebarState();
}

// Toggle sidebar and update localStorage when clicked
sidebarBtn.addEventListener("click", () => {
    toggle();
});

overlay.addEventListener("click", () => {
    toggle();
});