// fix attempt for modal close when deleting an image 
let shouldAllowModalClose = true;
let isConfirmingDelete = false;

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
    const closeModalBtns = document.querySelectorAll(".modal-close");
    const backBtn = document.querySelector(".modal-back");

    const galleryView = document.querySelector(".modal-gallery-view");
    const addPhotoView = document.querySelector(".modal-add-photo-view");

    const switchToAddPhoto = document.querySelector(".modal-add-photo-btn");

    // Open modal
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
            galleryView.classList.remove("hidden");
            addPhotoView.classList.add("hidden");
            fetchAndRenderModalGallery(); //  Fetch works when modal opens
        });
    }

    // Close modal on X icons
    closeModalBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    });

    // Close modal by clicking outside modal content

    modal.addEventListener("click", async (e) => {
        if (e.target === modal && shouldAllowModalClose) {
            modal.classList.add("hidden");

            //  After closing modal, refresh homepage gallery
            try {
                const updatedResponse = await fetch("http://localhost:5678/api/works");
                const updatedWorks = await updatedResponse.json();
                renderGallery(updatedWorks);
            }
            catch (error) {
                console.error("Failed to refresh gallery after closing modal:", error);
            }
        }
    });

    // Switch to "Add Photo" view
    if (switchToAddPhoto) {
        switchToAddPhoto.addEventListener("click", () => {
            galleryView.classList.add("hidden");
            addPhotoView.classList.remove("hidden");
            document.querySelector(".modal-back").style.display = "block"; // SHOW the back arrow after html & Css adjustment
        });
    }

    // Go back to gallery view
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            galleryView.classList.remove("hidden");
            addPhotoView.classList.add("hidden");
            document.querySelector(".modal-back").style.display = "none"; // HIDE the back arrow in gallery (just as safeguard)
        });
    }
});

// Function to render works inside the modal gallery
function renderModalGallery(works) {
    const modalGallery = document.querySelector(".modal-gallery-grid");
    modalGallery.innerHTML = ""; // Clearing existing thumbnails

    works.forEach(work => {
        // Create the container for each thumbnail
        const figure = document.createElement('figure');
        figure.classList.add("modal-thumbnail");

        // Create the image
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        // Create the trash icon (Font Awesome)
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash-can', 'delete-icon');
        deleteIcon.dataset.id = work.id; // Attaching the work ID for later deletion

        // Append elements
        figure.appendChild(img);
        figure.appendChild(deleteIcon);
        modalGallery.appendChild(figure);

        deleteIcon.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation(); // prevents outside click closing modal
            const photoId = deleteIcon.dataset.id; // Get the id from data-id
            const token = localStorage.getItem('token'); // Get the token

            if (!token) {
                alert("You are not authorized.");
                return;
            }

            // Setting the flag before confirmation
            shouldAllowModalClose = false;
            const confirmation = confirm("Are you sure you want to delete this photo?");
            shouldAllowModalClose = true;
            if (!confirmation) {
                return;


            }

            try {
                const response = await fetch(`http://localhost:5678/api/works/${photoId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // Successfully deleted! Remove the figure from the modal
                    figure.remove();
                    // Refresh gallery
                    // const updatedResponse = await fetch("http://localhost:5678/api/works");
                    // const updatedWorks = await updatedResponse.json();
                    // renderGallery(updatedWorks);  Removing this so it does not shut the modal
                } else {
                    alert("Failed to delete the photo. Please try again.");
                }
            } catch (error) {
                console.error("Error while deleting photo:", error);
                alert("Error connecting to the server.");
            }
        });
    });
}

// Fetch works and render them inside the modal when opening
function fetchAndRenderModalGallery() {
    fetch("http://localhost:5678/api/works")
        .then(response => response.json())
        .then(data => {
            renderModalGallery(data);
        })
        .catch(error => {
            console.error(" Failed to load works for modal:", error);
        });
}