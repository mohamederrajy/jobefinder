<main>
  <h1>Contact Us</h1>
  <div class="contact-form">
    <form on:submit|preventDefault={() => alert('Message sent!')}>
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" required>
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" required>
      </div>
      
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea id="message" rows="5" required></textarea>
      </div>
      
      <button type="submit">Send Message</button>
    </form>
  </div>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    color: #333;
    text-align: center;
  }

  .contact-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
  }

  input, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  button:hover {
    background: #2980b9;
  }
</style> 