const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
let successMessage = 'Product added successfully!';
let errorMessage = 'Error adding product. Please try again.';

async function loadProduct() {
    if (productId) {
        successMessage = 'Product updated successfully!';
        errorMessage = 'Error updating product. Please try again.';
        document.querySelector('h2').textContent = 'Edit Product';
        document.querySelector('input[name="id"]').value = productId;

        try {
            const response = await fetch('api/products.php?id=' + productId);
            const product = await response.json(); 

            if (product && !product.error) {
                document.querySelector('[name="name"]').value = product.name;
                document.querySelector('[name="price"]').value = product.price;
                document.querySelector('[name="description"]').value = product.description;
                document.querySelector('[name="availability_date"]').value = product.availability_date;
                
                document.querySelector('[name="in_stock"]').checked = (product.in_stock == 1);
            } else {
                alert(product.error || 'Error loading product data.');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            alert('An error occurred while loading the product.');
        }
    }
}

loadProduct();

const productForm = document.getElementById('addProductForm');
productForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
        const formData = new FormData(productForm);
        const response = await fetch('api/products.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message || successMessage);
            if (!productId) {
                productForm.reset();
            } else {
                window.location.href = 'index.php';
            }
        } else {
            alert(result.message || errorMessage);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('An error occurred while submitting the form.');
    }
});