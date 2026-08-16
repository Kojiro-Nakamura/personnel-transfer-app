import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export const NewWindowPortal = ({ children, title, onClose }) => {
  const [container, setContainer] = useState(null);
  const newWindow = useRef(null);

  useEffect(() => {
    // Open a new browser window
    newWindow.current = window.open('', '_blank', 'width=1400,height=900,left=100,top=100');
    
    if (!newWindow.current) {
      alert("ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。");
      onClose();
      return;
    }
    
    newWindow.current.document.title = title;
    
    // Set base URI so relative assets (CSS, images) load correctly in about:blank
    const base = newWindow.current.document.createElement('base');
    base.href = window.location.origin + window.location.pathname;
    newWindow.current.document.head.appendChild(base);
    
    // Copy all style sheets and style tags from the main window
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    styles.forEach(style => {
      newWindow.current.document.head.appendChild(style.cloneNode(true));
    });

    // Copy body and html classes for Tailwind/global styles
    newWindow.current.document.body.className = document.body.className;
    newWindow.current.document.documentElement.className = document.documentElement.className;

    // Create a container div for the React Portal
    const div = newWindow.current.document.createElement('div');
    newWindow.current.document.body.appendChild(div);
    setContainer(div);

    // Watch for window close event to sync state
    newWindow.current.addEventListener('beforeunload', () => {
      onClose();
    });

    // Cleanup when component unmounts (main window closes or modal state changes)
    return () => {
      if (newWindow.current && !newWindow.current.closed) {
        newWindow.current.close();
      }
    };
  }, []);

  // Render children into the new window's container using a portal
  return container ? createPortal(children, container) : null;
};
