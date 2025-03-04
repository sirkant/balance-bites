
import React from 'react';

/**
 * A utility component that renders a visible test element to verify React rendering
 * is working properly. This can help diagnose blank page issues.
 */
export const RenderTest = ({ id = 'render-test' }: { id?: string }) => {
  // Log when this component renders
  console.log(`RenderTest component with id ${id} is rendering`);
  
  React.useEffect(() => {
    console.log(`RenderTest component with id ${id} mounted`);
    
    // Add a test to the document to verify React is rendering
    const existingTest = document.getElementById(`${id}-div`);
    if (!existingTest) {
      const testDiv = document.createElement('div');
      testDiv.id = `${id}-div`;
      testDiv.style.position = 'fixed';
      testDiv.style.bottom = '10px';
      testDiv.style.right = '10px';
      testDiv.style.padding = '10px';
      testDiv.style.background = 'red';
      testDiv.style.color = 'white';
      testDiv.style.zIndex = '9999';
      testDiv.style.borderRadius = '4px';
      testDiv.textContent = 'Render Test Active';
      document.body.appendChild(testDiv);
    }
    
    return () => {
      // Clean up on unmount
      const testDiv = document.getElementById(`${id}-div`);
      if (testDiv) {
        document.body.removeChild(testDiv);
      }
      console.log(`RenderTest component with id ${id} unmounted`);
    };
  }, [id]);
  
  return (
    <div 
      id={id}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '5px 10px',
        background: 'rgba(255,0,0,0.8)',
        color: 'white',
        zIndex: 9999,
        borderRadius: '4px',
        fontSize: '12px'
      }}
    >
      React Rendering Test
    </div>
  );
};

/**
 * Adds a visible element to the DOM directly without using React
 * to verify if the DOM is working even when React isn't.
 */
export const addDomTestElement = () => {
  // Create a direct DOM element to verify DOM manipulation works
  const testEl = document.createElement('div');
  testEl.id = 'dom-test-element';
  testEl.style.position = 'fixed';
  testEl.style.bottom = '50px';
  testEl.style.right = '10px';
  testEl.style.padding = '10px';
  testEl.style.background = 'blue';
  testEl.style.color = 'white';
  testEl.style.zIndex = '9999';
  testEl.style.borderRadius = '4px';
  testEl.textContent = 'DOM Test Element';
  document.body.appendChild(testEl);
  
  console.log('DOM test element added to document body');
  return testEl;
};
