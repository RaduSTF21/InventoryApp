let currentPage = 1;

async function loadProducts(searchTerm = null) {
    const tableBody = document.querySelector('#productsTable tbody');
    const rows = document.getElementById('rowsPerPage');
    try {
        tableBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
        const limit = rows.value;
        const params = new URLSearchParams();
        params.append('limit', limit);
        if (searchTerm) params.append('search', searchTerm);
        params.append('page', currentPage);

        const response = await fetch(`api/products.php?${params.toString()}`);
        const data = await response.json();


        tableBody.replaceChildren();
        if (data.data.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 8;
            cell.textContent = 'No products found.';
            row.appendChild(cell);
            tableBody.appendChild(row);
        }
        data.data.forEach(product => {
            const row = document.createElement('tr');
            const idCell = document.createElement('td');
            idCell.textContent = product.id;
            idCell.dataset.label = 'ID';
            row.appendChild(idCell);
            const nameCell = document.createElement('td');
            nameCell.dataset.label = 'Name';
            row.appendChild(nameCell);
            nameCell.textContent = product.name;
            const priceCell = document.createElement('td');
            priceCell.dataset.label = 'Price';
            priceCell.textContent = product.price;
            row.appendChild(priceCell);
            const inStockCell = document.createElement('td');
            inStockCell.dataset.label = 'In Stock';
            const inStock = product.in_stock == 1;
            inStockCell.textContent = inStock ? 'Yes' : 'No';
            inStockCell.classList.add(inStock ? 'in-stock' : 'out-of-stock');
            row.appendChild(inStockCell);
            const availableCell = document.createElement('td');
            availableCell.dataset.label = 'Available Date';
            if (product.availability_date) {
                const date = new Date(product.availability_date);
                availableCell.textContent = date.toLocaleDateString();
            } else {
                availableCell.textContent = 'N/A';
            }
            row.appendChild(availableCell);
            const imageCell = document.createElement('td');
            if (product.image_path) {
                const img = document.createElement('img');
                img.src = `uploads/${product.image_path}`;
                img.alt = product.name;
                img.style.width = '50px';
                imageCell.appendChild(img);
            } else {
                imageCell.textContent = 'No Image';
            }
            imageCell.dataset.label = 'Image';
            row.appendChild(imageCell);
            const descriptionCell = document.createElement('td');
            descriptionCell.dataset.label = 'Description';
            descriptionCell.textContent = product.description;
            row.appendChild(descriptionCell);
            tableBody.appendChild(row);
            const actionsCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                window.location.href = `add_product.php?id=${product.id}`;
            });
            actionsCell.appendChild(editButton);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this product?')) {
                    try {
                        const deleteResponse = await fetch(`api/products.php?id=${product.id}`, {
                            method: 'DELETE'
                        });
                        const deleteResult = await deleteResponse.json();
                        if (deleteResult.success) {
                            alert('Product deleted successfully!');
                            loadProducts(searchTerm);
                        } else {
                            alert('Error deleting product: ' + deleteResult.message);
                        }
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        alert('An error occurred while deleting the product.');
                    }
                }

            });
            actionsCell.appendChild(deleteButton);
            row.appendChild(actionsCell);
        });
        renderPagination(data.total, data.limit, data.page);

    } catch (error) {
        console.error('Error loading products:', error);
        tableBody.replaceChildren();
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 8;
        cell.textContent = 'Error loading products';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

const searchInput = document.getElementById('searchInput');
let timer;

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim();
    clearTimeout(timer);
    timer = setTimeout(() => {
        currentPage = 1;
        loadProducts(searchTerm);
    }, 300);
});
const rows = document.getElementById('rowsPerPage');
rows.addEventListener('change', () => {
    const searchTerm = searchInput.value.trim();
    currentPage = 1;
    loadProducts(searchTerm);
});
function renderPagination(totalItems, itemsPerPage,onPage) {
    const paginationContainer = document.getElementById('paginationContainer');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.replaceChildren();
    if (onPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            currentPage--;
            const searchTerm = document.getElementById('searchInput').value.trim();
            loadProducts(searchTerm);
        });
        paginationContainer.appendChild(prevButton);
    }
    let startPage = Math.max(1, onPage - 2);
    let endPage = Math.min(totalPages, onPage + 2);
    if (startPage > 1) {
        createPageButton(1, paginationContainer);
        if (startPage > 2) {
            const span = document.createElement('span');
            span.textContent = '...';
            paginationContainer.appendChild(span);
        }
    }
    for (let i = startPage; i <= endPage; i++) {
        createPageButton(i, paginationContainer, i === currentPage);
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const span = document.createElement('span');
            span.textContent = '...';
            paginationContainer.appendChild(span);
        }
        createPageButton(totalPages, paginationContainer);
    }
    if (onPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            currentPage++;
            const searchTerm = document.getElementById('searchInput').value.trim();
            loadProducts(searchTerm);
        });
        paginationContainer.appendChild(nextButton);
    }
}

function createPageButton(page, container, isActive = false) {
    const button = document.createElement('button');
    button.textContent = page;
    if (isActive) {
        button.classList.add('active');
    }
    button.addEventListener('click', () => {
        currentPage = page;
        const searchTerm = document.getElementById('searchInput').value.trim();
        loadProducts(searchTerm);
    });
    container.appendChild(button);
}