import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export const NewWindowPortal = ({ children, title, targetWindow = null, onClose, onBlocked }) => {
  const [container, setContainer] = useState(null);
  const winRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onBlockedRef = useRef(onBlocked);

  useEffect(() => {
    onCloseRef.current = onClose;
    onBlockedRef.current = onBlocked;
  }, [onClose, onBlocked]);

  useEffect(() => {
    const win =
      targetWindow && !targetWindow.closed
        ? targetWindow
        : window.open('', '_blank', 'width=1440,height=920,left=60,top=40');

    if (!win) {
      if (onBlockedRef.current) {
        onBlockedRef.current();
      } else if (onCloseRef.current) {
        alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
        onCloseRef.current();
      }
      return undefined;
    }

    winRef.current = win;
    const doc = win.document;
    doc.title = title || '採用計画シミュレーター';

    // Reset head/body cleanly if freshly opened about:blank
    doc.body.innerHTML = '';
    doc.body.style.margin = '0';
    doc.body.style.backgroundColor = '#f8fafc';

    // Sync stylesheets & style tags from parent document (resolving href to full URLs for production builds)
    const syncStyles = () => {
      doc.head.querySelectorAll('[data-synced-style="1"]').forEach(el => el.remove());
      const nodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
      nodes.forEach(node => {
        if (node.tagName === 'LINK') {
          const link = doc.createElement('link');
          link.rel = 'stylesheet';
          link.href = node.href;
          link.setAttribute('data-synced-style', '1');
          doc.head.appendChild(link);
        } else {
          const style = doc.createElement('style');
          style.textContent = node.textContent;
          style.setAttribute('data-synced-style', '1');
          doc.head.appendChild(style);
        }
      });
    };
    syncStyles();

    const observer = new MutationObserver(() => {
      if (!win.closed) syncStyles();
    });
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    doc.body.className = document.body.className;
    doc.documentElement.className = document.documentElement.className;

    const mountNode = doc.createElement('div');
    mountNode.id = 'portal-sim-root';
    doc.body.appendChild(mountNode);
    setContainer(mountNode);

    let closedNotified = false;
    const handleWindowClose = () => {
      if (closedNotified) return;
      closedNotified = true;
      if (onCloseRef.current) onCloseRef.current();
    };
    win.addEventListener('beforeunload', handleWindowClose);
    win.addEventListener('pagehide', handleWindowClose);
    win.focus();

    return () => {
      closedNotified = true;
      observer.disconnect();
      win.removeEventListener('beforeunload', handleWindowClose);
      win.removeEventListener('pagehide', handleWindowClose);
      if (winRef.current && !winRef.current.closed) {
        winRef.current.close();
      }
    };
  }, [targetWindow]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (winRef.current && !winRef.current.closed && title) {
      winRef.current.document.title = title;
    }
  }, [title]);

  return container ? createPortal(children, container) : null;
};
