// Simple test to check if React app works
console.log('Testing React app...');

try {
  // Check if React is loaded
  if (typeof React !== 'undefined') {
    console.log('React is loaded');
  } else {
    console.error('React is not loaded');
  }
  
  // Check if ReactDOM is loaded
  if (typeof ReactDOM !== 'undefined') {
    console.log('ReactDOM is loaded');
  } else {
    console.error('ReactDOM is not loaded');
  }
  
  // Check if the root element exists
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('Root element found');
    console.log('Root element content:', rootElement.innerHTML.substring(0, 200));
  } else {
    console.error('Root element not found');
  }
} catch (error) {
  console.error('Test failed:', error);
}
