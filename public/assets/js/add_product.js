

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
        alert('Product added successfully!');
        productForm.reset();
    } else {
        alert('Error adding product: ' + result.message);
    }

    console.log('Form submitted');
    console.log(result);


});
