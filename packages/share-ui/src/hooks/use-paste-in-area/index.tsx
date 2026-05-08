import { useState, useEffect } from 'react';

export default function usePasteInArea() {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files) setFiles(Array.from(files));
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  return { files };
}
