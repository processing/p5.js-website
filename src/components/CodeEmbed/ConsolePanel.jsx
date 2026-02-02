import { useRef, useEffect } from "preact/hooks";
import { Icon } from "../Icon";

export const ConsolePanel = ({ logs, onClear, onClose }) => {
  const listRef = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-40 w-full border-t-2 border-accent-color bg-white font-mono text-sm">
      <div className="flex items-center justify-between bg-bg-gray-10 px-2 py-1 border-b border-gray-200">
        <span className="font-bold text-gray-600">Console</span>
        <div className="flex gap-2">
           <button 
            onClick={onClear} 
            className="text-xs hover:text-accent-color px-2 py-1 rounded"
            aria-label="Clear console"
          >
            Clear
          </button>
          <button 
            onClick={onClose} 
            className="hover:text-accent-color"
            aria-label="Close console"
          >
            <Icon kind="close" />
          </button>
        </div>
      </div>
      <ul 
        ref={listRef} 
        className="flex-1 overflow-y-auto p-2 m-0 list-none space-y-1"
      >
        {logs.length === 0 && (
          <li className="text-gray-400 italic text-xs">No output yet...</li>
        )}
        {logs.map((log, i) => (
          <li 
            key={i} 
            className={`
              border-b border-gray-100 last:border-0 pb-1 break-words
              ${log.level === 'error' ? 'text-red-600 bg-red-50' : ''}
              ${log.level === 'warn' ? 'text-yellow-600 bg-yellow-50' : ''}
              ${log.level === 'info' ? 'text-blue-600' : ''}
              ${log.level === 'log' ? 'text-gray-800' : ''}
            `}
          >
            {log.args && log.args.map((arg, j) => (
              <span key={j} className="mr-2">
                {typeof arg === 'object' ? JSON.stringify(arg) : String(arg)}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};
