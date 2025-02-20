<script>
  import '../app.css';
  import { Navbar } from '../components/navbar';
  import { Footer } from '../components/footer';
</script>

<Navbar />

<slot />

<Footer />

<style>
  footer {
    text-align: center;
    padding: 2rem;
    background: #333;
    color: white;
    margin-top: auto;
  }
</style> 