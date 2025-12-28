import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Remove: import tailwindcss from '@tailwindcss/vite'; 

export default defineConfig({
  plugins: [
    react(), 
    // Remove: tailwindcss(), 
  ],
})