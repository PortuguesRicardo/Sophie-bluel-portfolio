// Select the gallery container
const galleryContainer = document.querySelector('.gallery');

// Reusable function to render works
function renderGallery(works) {
    galleryContainer.innerHTML = "";

    works.forEach(work => {
        const figure = document.createElement('figure');

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const caption = document.createElement('figcaption');
        caption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        galleryContainer.appendChild(figure);
    });
}

// Initial fetch and render of all works
fetch("http://localhost:5678/api/works")
    .then(res => res.json())
    .then(data => {
        renderGallery(data);
    })
    .catch(error => {
        console.error(" Failed to load works:", error);
        galleryContainer.innerHTML = "<p>Failed to load projects.</p>";
    });

// Fetch categories and render filter buttons
fetch("http://localhost:5678/api/categories")
    .then(response => response.json())
    .then(categories => {
        const filtersContainer = document.createElement('div');
        filtersContainer.classList.add('filters');
        filtersContainer.id = "filtersContainer"; // adding id so it can hide when in admin mode
        // document.querySelector('#portfolio').prepend(filtersContainer); wrong because this adds the filters above the h2
        const heading = document.querySelector("#portfolio h2");
        const titleContainer = document.querySelector(".projects-title-container");
        titleContainer.insertAdjacentElement("afterend", filtersContainer); //This guarantees the filters appear right below the full “My Projects” heading + edit button combo.

        // "All" button
        const allBtn = document.createElement('button');
        allBtn.textContent = 'All';
        allBtn.classList.add('active');
        filtersContainer.appendChild(allBtn);
        // Hide filters if logged in
        if (localStorage.getItem("token")) {
            filtersContainer.style.display = "none";
        }

        // Buttons for each category
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.name;
            button.dataset.categoryId = category.id;
            filtersContainer.appendChild(button);
        });

        // Handle filtering
        filtersContainer.addEventListener('click', event => {
            if (event.target.tagName !== 'BUTTON') return;

            // Visual active state
            document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const selectedId = event.target.dataset.categoryId;

            fetch("http://localhost:5678/api/works")
                .then(response => response.json())
                .then(works => {
                    const filtered = selectedId
                        ? works.filter(work => work.categoryId == selectedId)
                        : works;

                    renderGallery(filtered);
                });
        });
    });
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const authNav = document.querySelector(".auth-nav");

    if (!authNav) return; // safety check to prevent break if .auth-nav is missing on a page.

    if (token) {
        // Show Logout button
        authNav.innerHTML = `<a href="#" id="logout-link">Logout</a>`;

        document.querySelector("#logout-link").addEventListener("click", (e) => {
            e.preventDefault();  // prevents default link behaviour, so it does not send the user straight to the login page before logging out.
            localStorage.removeItem("token");   //Clicking "Logout" clears the token and sends user to the homepage.
            window.location.href = "index.html"; // to redirect user to index or log in after logging out, if necessary.
        });
    } else {
        // Keep or restore Login link (if coming back from logout)
        authNav.innerHTML = `<a href="login.html" id="login-link">Login</a>`;
    }

    // showing admin edit after token check



    const adminBar = document.getElementById("admin-bar");
    const editButtons = document.querySelectorAll(".edit-btn");
    const filters = document.getElementById("filtersContainer");

    if (token) {
        if (adminBar) adminBar.style.display = "flex";
        editButtons.forEach(btn => btn.style.display = "inline-flex");

    }
});




// Modal Logic


document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const openModalBtn = document.querySelector(".edit-btn"); // specific trigger can change here
    const closeModalBtns = document.querySelectorAll(".close-modal");
    const backBtn = document.querySelector(".go-back");

    const galleryView = document.querySelector(".modal-gallery-view");
    const addPhotoView = document.querySelector(".modal-add-photo-view");

    const switchToAddPhoto = document.querySelector(".modal-add-photo-btn");

    // Open modal
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
            galleryView.classList.remove("hidden");
            addPhotoView.classList.add("hidden");
        });
    }

    // Close modal on X icons
    closeModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    });

    // Close modal by clicking outside modal content
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });

    // Switch to "Add Photo" view
    if (switchToAddPhoto) {
        switchToAddPhoto.addEventListener("click", () => {
            galleryView.classList.add("hidden");
            addPhotoView.classList.remove("hidden");
        });
    }

    // Go back to gallery view
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            galleryView.classList.remove("hidden");
            addPhotoView.classList.add("hidden");
        });
    }
});