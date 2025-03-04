
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addDomTestElement } from './utils/renderTest.tsx';

console.log('main.tsx script is executing');

// Add a DOM test element to verify DOM manipulation works even if React doesn't
addDomTestElement();

// Get the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Failed to find the root element');
  throw new Error('Failed to find the root element');
} else {
  console.log('Root element found:', rootElement);
}

try {
  console.log('Attempting to render React app');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('React app render initiated');
} catch (error) {
  console.error('Failed to render React app:', error);
  
  // Fallback rendering in case the main app fails
  const errorDiv = document.createElement('div');
  errorDiv.style.padding = '20px';
  errorDiv.style.color = 'red';
  errorDiv.innerHTML = `<h1>Error Rendering App</h1><pre>${error instanceof Error ? error.message : String(error)}</pre>`;
  rootElement.appendChild(errorDiv);
}
