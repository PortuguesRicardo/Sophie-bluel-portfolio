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
        // document.querySelector('#portfolio').prepend(filtersContainer); wrong because this adds the filters above the h2
        const heading = document.querySelector("#portfolio h2");
        heading.insertAdjacentElement("afterend", filtersContainer);

        // "All" button
        const allBtn = document.createElement('button');
        allBtn.textContent = 'All';
        allBtn.classList.add('active');
        filtersContainer.appendChild(allBtn);

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