<script lang="ts">
  import { onMount } from 'svelte';
  import { subscription } from '../../stores/subscriptionStore';
  import { goto } from '$app/navigation';
  import { user } from '../../stores/userStore';

  export let requiresPaid = true;

  onMount(async () => {
    if (!$user?.token) {
      goto('/login');
      return;
    }

    const status = await subscription.checkStatus();
    console.log('Guard checking subscription:', status);
    
    if (requiresPaid && (!status || !status.isPaid)) {
      console.log('User needs premium, redirecting to pricing...');
      goto('/pricing');
    }
  });
</script>

<slot /> 