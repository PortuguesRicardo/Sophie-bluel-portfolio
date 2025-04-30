// Page Load counter to track reloads

let pageLoadCount = localStorage.getItem('pageLoadCount') || 0;
pageLoadCount++;
localStorage.setItem('pageLoadCount', pageLoadCount);
console.log(`Page has loaded ${pageLoadCount} times`);





let modalBusy = false;  // flag fix to prevent backdrop closure.


//defining showModalMessage and replacing alert() for it. Removing alerts from the code to maybe fix backdrop listener
function showModalMessage(message, type = "info") {
    const existingMsg = document.querySelector(".modal-feedback");
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement("p");
    msg.classList.add("modal-feedback", type);
    msg.textContent = message;

    document.querySelector(".modal-content")?.appendChild(msg);

    setTimeout(() => msg.remove(), 3000);
}

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
fetchWorks()  // Replacing old block 

// Fetch categories and render filter buttons
fetch("http://localhost:5678/api/categories")
    .then(response => response.json())
    .then(categories => {
        const filtersContainer = document.createElement('div');
        filtersContainer.classList.add('filters');
        filtersContainer.id = "filtersContainer"; // adding id so it can hide when in admin mode
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
    populateCategorySelect(); // adding for category select in upload 
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
            closeModalAndRefresh();
            uploadForm.reset();  // added logic for uploaded preview to be removed when closing modal on X
            const previewImg = uploadArea.querySelector('.preview-img');
            if (previewImg) previewImg.remove();
            uploadIcon.style.display = "block";
            uploadLabel.style.display = "block";
            uploadHint.style.display = "block";
        });
    });

    // 
    //Only close when user clicks directly on modal overlay and modal is NOT busy
    modal.addEventListener("click", async (e) => {

        if (e.target === modal && !modalBusy) {
            closeModalAndRefresh();

        }
    });

    ////Creating a cleaner reusable function for closing and refreshing
    async function closeModalAndRefresh() {
        modal.classList.add("hidden");
        try {
            await fetchWorks(); // Refresh gallery only after modal is dismissed
        } catch (error) {
            console.error("Gallery refresh failed:", error);
        }
    }

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
            const previewImg = uploadArea.querySelector('.preview-img');
            if (previewImg) previewImg.remove();
            uploadIcon.style.display = "block";
            uploadLabel.style.display = "block";
            uploadHint.style.display = "block";
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
            e.stopPropagation(); // prevents bubbling issues (optional)
            e.preventDefault();

            modalBusy = true;

            const photoId = deleteIcon.dataset.id; // Get the id from data-id
            const token = localStorage.getItem('token'); // Get the token

            if (!token) {
                alert("You are not authorized.");
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
                    console.log("Photo deleted successfully")
                    modalBusy = false;
                    // OPTIONAL: Refresh homepage gallery too
                    await fetchWorks();
                } else {
                    console.log("Failed to delete the photo. Please try again.");
                }
            } catch (error) {
                console.error("Error while deleting photo:", error);
                showModalMessage("Error connecting to the server.");
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

//  replacing whole blocks for -  fetchWorks()  
async function fetchWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const works = await response.json();

        renderGallery(works);       // Main page gallery
        renderModalGallery(works);  // Modal thumbnails
    } catch (err) {
        console.error("Failed to fetch works:", err);
    }
}


// Fetch and Populate Categories in Upload Form 

function populateCategorySelect() {
    fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('photo-category');

            // Clear existing options first (except first empty one)
            categorySelect.innerHTML = '<option value=""></option>';

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
        });
}

// ====== Upload Form Handling ======

const uploadForm = document.getElementById('photo-form');
const imageInput = document.getElementById('image-upload');
const uploadArea = document.querySelector('.upload-area');
const uploadLabel = document.querySelector('.upload-label');
const uploadIcon = uploadArea.querySelector('.fa-image');
const uploadHint = uploadArea.querySelector('.upload-hint');

//  Live Preview on Image Selection 
imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Create or update preview image
            let previewImg = uploadArea.querySelector('.preview-img');
            if (!previewImg) {
                previewImg = document.createElement('img');
                previewImg.classList.add('preview-img');
                uploadArea.appendChild(previewImg);
            }
            previewImg.src = e.target.result;

            // Hide icon, label and hint
            uploadIcon.style.display = "none";
            uploadLabel.style.display = "none";
            uploadHint.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
});
// Handle Submit (Intercept without uploading yet)

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload on submit

    modalBusy = true;

    const file = imageInput.files[0];
    const title = document.getElementById('photo-title').value.trim();
    const category = document.getElementById('photo-category').value;

    //  Validation 
    if (!file || !title || !category) {
        showModalMessage("Please complete all fields and select a photo.", "error");
        return;
    }

    //  Preparing FormData 
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('category', category);

    console.log("FormData prepared:", formData);

    // (Next step: actually POST it to the API)
    const token = localStorage.getItem('token'); // Authorization token

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const successMsg = document.createElement("p");
            successMsg.textContent = "Photo uploaded successfully!";
            successMsg.classList.add("upload-success");
            uploadForm.appendChild(successMsg);

            // Remove after a few seconds
            setTimeout(() => {
                successMsg.remove();
            }, 3000);

            // Reset the form visually
            uploadForm.reset();
            const previewImg = uploadArea.querySelector('.preview-img');
            if (previewImg) previewImg.remove();
            uploadIcon.style.display = "block";
            uploadLabel.style.display = "block";
            uploadHint.style.display = "block";
            modalBusy = false;
            // Refresh galleries
            await fetchWorks();

        } else {
            showModalMessage("Failed to upload the photo.", "error");
        }
    } catch (error) {
        console.error("Upload failed:", error);
        showModalMessage("Error uploading photo. Please try again.", "error");
    } finally {
        modalBusy = false; // resets the flag even if something fails
    }
});

