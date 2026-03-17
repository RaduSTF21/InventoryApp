const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
let successMessage = 'Product added successfully!';
let errorMessage = 'Error adding product. Please try again.';
if(productId){
    successMessage = 'Product updated successfully!';
    errorMessage = 'Error updating product. Please try again.';
    document.querySelector('h2').textContent = 'Edit Product';
    document.querySelector('input[name="id"]').value = productId;
    data = fetch('api/products.php?id=' + productId)
        .then(response => response.json())
        .then(product => {
            document.querySelector('[name="name"]').value = product.name;
            document.querySelector('[name="description"]').value = product.description;
            document.querySelector('[name="price"]').value = product.price;
            document.querySelector('[name="in_stock"]').checked = product.in_stock == 1;
            document.querySelector('[name="availability_date"]').value = product.availability_date;
        })
        .catch(error => console.error('Error fetching product:', error));
        

}

const productForm = document.getElementById('addProductForm');
productForm.addEventListener('submit', async function(event){
    event.preventDefault();
    const formData = new FormData(productForm);
    const response = await fetch('api/products.php', {
        method: 'POST',
        body: formData
    });
    const result= await response.json();
    if(result.success){
        alert(successMessage);
        productForm.reset();
    } else {
        alert(errorMessage);
    }

    console.log('Form submitted');
    console.log(result);


});
