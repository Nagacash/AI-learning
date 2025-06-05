
// This file can be used for global type declarations.

// Declare Chart.js globally since it's loaded via CDN
declare global {
  interface Window {
    Chart: any; // Using 'any' for simplicity, can be replaced with more specific Chart.js types if needed
  }
}

// Ensure this file is treated as a module.
export {};
