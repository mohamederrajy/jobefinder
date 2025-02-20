<script>
  let products = [
    {
      id: 1,
      name: 'Product 1',
      price: 99.99,
      description: 'This is product 1 description'
    },
    {
      id: 2,
      name: 'Product 2',
      price: 149.99,
      description: 'This is product 2 description'
    },
    {
      id: 3,
      name: 'Product 3',
      price: 199.99,
      description: 'This is product 3 description'
    }
  ];
</script>

<div class="products-grid">
  {#each products as product}
    <div class="product-card">
      <h2>{product.name}</h2>
      <p class="price">${product.price}</p>
      <p class="description">{product.description}</p>
      <button>Add to Cart</button>
    </div>
  {/each}
</div>

<style>
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  h2 {
    color: #333;
    margin-bottom: 10px;
  }

  .price {
    font-size: 1.2em;
    color: #2ecc71;
    font-weight: bold;
  }

  .description {
    color: #666;
    margin: 10px 0;
  }

  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  button:hover {
    background: #2980b9;
  }
</style> 