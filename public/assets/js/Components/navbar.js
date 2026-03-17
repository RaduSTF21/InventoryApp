class AppNavbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
           <nav class="navbar"> 
                <div class="nav-container"> 
                    <a href="index.php" class="nav-logo">Inventory App</a>
                    <ul class="nav-links">
                        <li><a href="index.php">Home</a></li>
                        <li><a href="add_product.php">Add Product</a></li>
                    </ul>
                </div>
        </nav>
        `;
    }
}

customElements.define('app-navbar', AppNavbar);