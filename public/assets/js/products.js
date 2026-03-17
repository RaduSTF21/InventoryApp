let currentPage = 1;

async function loadProducts(searchTerm = null) {
    const tableBody = document.querySelector('#productsTable tbody');

    try {
        tableBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
        const params = new URLSearchParams();
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
        data.data.forEach(product =>{
            const row = document.createElement('tr');
            const idCell = document.createElement('td');
            idCell.textContent = product.id;
            row.appendChild(idCell);
            const nameCell = document.createElement('td');
            row.appendChild(nameCell);
            nameCell.textContent = product.name;
            const priceCell = document.createElement('td');
            priceCell.textContent = product.price;
            row.appendChild(priceCell);
            const inStockCell = document.createElement('td');
            const inStock = product.in_stock  == 1;
            inStockCell.textContent = inStock ? 'Yes' : 'No';
            inStockCell.classList.add(inStock ? 'in-stock' : 'out-of-stock');            
            row.appendChild(inStockCell);
            const availableCell = document.createElement('td');
            if(product.availability_date){
                const date = new Date(product.availability_date);
                availableCell.textContent = date.toLocaleDateString();
            } else {
                availableCell.textContent = 'N/A';
            }
            row.appendChild(availableCell);
            const imageCell = document.createElement('td');
            if(product.image_path){
                const img = document.createElement('img');
                img.src = `uploads/${product.image_path}`;
                img.alt = product.name;
                img.style.width = '50px';
                imageCell.appendChild(img);
            } else {
                imageCell.textContent = 'No Image';
            }
            row.appendChild(imageCell);
            const descriptionCell = document.createElement('td');
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

function renderPagination(totalItems,itemsPerPage,currentPage){
    const paginationContainer = document.getElementById('paginationContainer');
   const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.replaceChildren();
    let startPage = Math.max(1,currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if(startPage > 1){
        createPageButton(1, paginationContainer);
        if(startPage > 2){
            const span = document.createElement('span');
            span.textContent = '...';
            paginationContainer.appendChild(span);
        }
    }
    for(let i = startPage; i<= endPage; i++){
        createPageButton(i, paginationContainer, i === currentPage);
    }
    if(endPage < totalPages){
        if(endPage < totalPages - 1){
            const span = document.createElement('span');
            span.textContent = '...';
            paginationContainer.appendChild(span);
        }
        createPageButton(totalPages, paginationContainer);
    }
}

function createPageButton(page, container, isActive = false){
    const button = document.createElement('button');
    button.textContent = page;
    if(isActive){
        button.classList.add('active');
    }
    button.addEventListener('click', () => {
        currentPage = page;
        const searchTerm = document.getElementById('searchInput').value.trim();
        loadProducts(searchTerm);
    });
    container.appendChild(button);
}