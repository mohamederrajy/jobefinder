<script lang="ts">
  import { goto } from '$app/navigation';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { user } from '../../../stores/userStore';
  import { onMount } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  
  interface JobData {
    title: string;
    company: string;
    hourlyRate: number;
    about: string;
    jobUrl: string;
    contactDetails: {
      name: string;
      email: string;
      phone: string;
    };
    requirements: string[];
    isUrgent: boolean;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    tags: string[];
  }

  let jobData: JobData = {
    title: '',
    company: '',
    hourlyRate: 0,
    about: '',
    jobUrl: '',
    contactDetails: {
      name: '',
      email: '',
      phone: ''
    },
    requirements: [''],
    isUrgent: false,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    tags: ['']
  };

  let editorElement: HTMLElement;
  let editor: Editor;
  let loading = false;
  let error: string | null = null;

  // Verify admin token on mount
  async function verifyAdminToken() {
    try {
      if (!$user?.token || $user?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Verify token with backend
      const response = await fetch(`${PUBLIC_API_URL}/admin/verify`, {
        headers: {
          'x-auth-token': $user.token
        }
      });

      if (!response.ok) {
        throw new Error('Invalid admin token');
      }
    } catch (err) {
      console.error('Admin verification failed:', err);
      error = 'Admin access required. Please login with admin credentials.';
      await goto('/login');
    }
  }

  onMount(() => {
    verifyAdminToken();
    
    // Initialize TipTap editor after element is mounted
    if (editorElement) {
      editor = new Editor({
        element: editorElement,
        extensions: [
          StarterKit,
        ],
        content: jobData.about,
        onUpdate: ({ editor }) => {
          jobData.about = editor.getHTML();
        },
      });
    }

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  });

  function addRequirement() {
    jobData.requirements = [...jobData.requirements, ''];
  }

  function addTag() {
    jobData.tags = [...jobData.tags, ''];
  }

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      // Double check admin privileges
      if (!$user?.token || $user?.role !== 'admin') {
        throw new Error('Admin access required');
      }

      // Clean up empty requirements and tags
      jobData.requirements = jobData.requirements.filter(req => req.trim());
      jobData.tags = jobData.tags.filter(tag => tag.trim());

      const response = await fetch(`${PUBLIC_API_URL}/admin/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': $user.token
        },
        body: JSON.stringify({
          ...jobData,
          isActive: true,
          status: 'open'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Job creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data
        });

        if (response.status === 403 || response.status === 401) {
          error = 'Admin access required. Please login with admin credentials.';
          await goto('/login');
          return;
        }

        throw new Error(data.message || `Failed to create job: ${response.statusText}`);
      }

      console.log('Job created successfully:', data);
      await goto('/admin/dashboard');
    } catch (err) {
      console.error('Error creating job:', err);
      if (err instanceof Error) {
        error = err.message;
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="admin-layout">
  <div class="header">
    <h1>Add New Job</h1>
  </div>

  {#if error}
    <div class="error-banner">{error}</div>
  {/if}

  <form class="job-form" on:submit|preventDefault={handleSubmit}>
    <div class="form-grid">
      <div class="form-section">
        <h2>Basic Information</h2>
        
        <div class="form-group">
          <label for="title">Job Title*</label>
          <input 
            type="text" 
            id="title"
            bind:value={jobData.title}
            required
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div class="form-group">
          <label for="company">Company Name*</label>
          <input 
            type="text" 
            id="company"
            bind:value={jobData.company}
            required
            placeholder="e.g. Tech Corp Inc."
          />
        </div>

        <div class="form-group">
          <label for="hourlyRate">Hourly Rate (USD)*</label>
          <input 
            type="number" 
            id="hourlyRate"
            bind:value={jobData.hourlyRate}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div class="form-group">
          <label for="jobUrl">Job URL</label>
          <input 
            type="url" 
            id="jobUrl"
            bind:value={jobData.jobUrl}
            placeholder="e.g. https://company.com/careers/job"
          />
        </div>

        <div class="form-section">
          <h2>Contact Information</h2>
          
          <div class="form-group">
            <label for="contactName">Contact Name</label>
            <input 
              type="text" 
              id="contactName"
              bind:value={jobData.contactDetails.name}
              placeholder="e.g. HR Department"
            />
          </div>

          <div class="form-group">
            <label for="contactEmail">Contact Email</label>
            <input 
              type="email" 
              id="contactEmail"
              bind:value={jobData.contactDetails.email}
              placeholder="e.g. hr@company.com"
            />
          </div>

          <div class="form-group">
            <label for="contactPhone">Contact Phone</label>
            <input 
              type="tel" 
              id="contactPhone"
              bind:value={jobData.contactDetails.phone}
              placeholder="e.g. +1-555-123-4567"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="about">About the Job*</label>
          <div class="editor-wrapper">
            <div class="editor-toolbar">
              <button type="button" on:click={() => editor?.chain().focus().toggleBold().run()} 
                class:active={editor?.isActive('bold')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                </svg>
              </button>
              <button type="button" on:click={() => editor?.chain().focus().toggleItalic().run()}
                class:active={editor?.isActive('italic')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
                </svg>
              </button>
              <button type="button" on:click={() => editor?.chain().focus().toggleBulletList().run()}
                class:active={editor?.isActive('bulletList')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
                </svg>
              </button>
              <button type="button" on:click={() => editor?.chain().focus().toggleOrderedList().run()}
                class:active={editor?.isActive('orderedList')}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
                </svg>
              </button>
            </div>
            <div class="editor-content" bind:this={editorElement}></div>
          </div>
        </div>

        <!-- Requirements Section -->
        <div class="form-group">
          <label>Requirements*</label>
          {#each jobData.requirements as requirement, i}
            <div class="array-input">
              <input
                type="text"
                bind:value={jobData.requirements[i]}
                placeholder="Enter job requirement"
                required
              />
              {#if i === jobData.requirements.length - 1}
                <button type="button" class="add-button" on:click={addRequirement}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Tags Section -->
        <div class="form-group">
          <label>Tags*</label>
          {#each jobData.tags as tag, i}
            <div class="array-input">
              <input
                type="text"
                bind:value={jobData.tags[i]}
                placeholder="Enter job tag"
                required
              />
              {#if i === jobData.tags.length - 1}
                <button type="button" class="add-button" on:click={addTag}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </button>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Address Section -->
        <div class="form-group">
          <label>Address*</label>
          <input
            type="text"
            bind:value={jobData.address.street}
            placeholder="Street Address"
            required
          />
          <input
            type="text"
            bind:value={jobData.address.city}
            placeholder="City"
            required
          />
          <input
            type="text"
            bind:value={jobData.address.state}
            placeholder="State"
            required
          />
          <input
            type="text"
            bind:value={jobData.address.zipCode}
            placeholder="ZIP Code"
            required
            pattern="\d{5}"
          />
        </div>

        <!-- Urgent Checkbox -->
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              bind:checked={jobData.isUrgent}
            />
            Mark as Urgent
          </label>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="submit-button" disabled={loading || !editor}>
        {loading ? 'Adding Job...' : 'Add Job'}
      </button>
    </div>
  </form>
</div>

<style>
  .admin-layout {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 2rem;
  }

  .admin-container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 1.875rem;
    font-weight: 600;
    color: #111827;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6355FF;
    text-decoration: none;
    font-weight: 500;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .form-section {
    grid-column: 1 / -1;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  label {
    font-weight: 500;
    color: #374151;
  }

  input, textarea {
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #6355FF;
    box-shadow: 0 0 0 3px rgba(99, 85, 255, 0.1);
  }

  .array-input {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .add-button {
    padding: 0.5rem;
    background: #f3f4f6;
    border: none;
    border-radius: 8px;
    color: #6355FF;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-button:hover {
    background: #e5e7eb;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .error-banner {
    background: #FEE2E2;
    color: #DC2626;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
  }

  .form-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .submit-button {
    background: #6355FF;
    color: white;
    border: none;
    padding: 0.875rem 2rem;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-button:hover {
    background: #5346E0;
    transform: translateY(-1px);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .admin-layout {
      padding: 1rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }

  .editor-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .editor-toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }

  .editor-toolbar button {
    padding: 0.5rem;
    border: none;
    background: none;
    border-radius: 4px;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
  }

  .editor-toolbar button:hover {
    background: #e5e7eb;
    color: #111827;
  }

  .editor-toolbar button.active {
    background: #6355FF;
    color: white;
  }

  .editor-content {
    min-height: 200px;
    padding: 1rem;
    background: white;
    border: none;
    outline: none;
  }

  .editor-content:focus {
    outline: none;
  }

  :global(.editor-content p) {
    margin: 0.5em 0;
  }

  :global(.editor-content ul, .editor-content ol) {
    padding-left: 1.5em;
  }

  :global(.ProseMirror) {
    min-height: 200px;
    outline: none;
  }

  :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: #adb5bd;
    pointer-events: none;
    height: 0;
  }
</style> 