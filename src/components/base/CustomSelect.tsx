import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface Option {
  value: string;
  label: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: string;
}

const DROPDOWN_MAX_HEIGHT = 240;

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  icon,
}: CustomSelectProps) => {
  const { isLightMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward =
      spaceBelow < DROPDOWN_MAX_HEIGHT + 8 && spaceAbove > spaceBelow;

    setDropdownPos({
      top: openUpward ? rect.top - 8 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }, []);

  const openDropdown = () => {
    calculatePosition();
    setIsOpen(true);
  };

  /* Close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inPortal = document.getElementById('custom-select-portal')?.contains(target);
      if (!inTrigger && !inPortal) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  /* Recalculate on scroll/resize */
  useEffect(() => {
    if (!isOpen) return;
    const update = () => calculatePosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, calculatePosition]);

  /* Scroll selected into view */
  useEffect(() => {
    if (isOpen && listRef.current) {
      const idx = options.findIndex((opt) => opt.value === value);
      if (idx !== -1) {
        setHighlightedIndex(idx);
        const item = listRef.current.children[idx] as HTMLElement;
        if (item) item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, value, options]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  /* Portal dropdown rendered at body level — escapes all stacking contexts */
  const dropdownPortal = createPortal(
    <div
      id="custom-select-portal"
      style={{
        position: 'fixed',
        top: dropdownPos.openUpward ? undefined : dropdownPos.top,
        bottom: dropdownPos.openUpward
          ? window.innerHeight - dropdownPos.top
          : undefined,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 99999,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      className={`transition-all duration-200 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
      }`}
    >
      <div
        className={`border rounded-lg shadow-xl ${
          isLightMode
            ? 'bg-white border-gray-200 shadow-gray-300/40'
            : 'bg-[#252b48] border-white/10 shadow-black/40'
        }`}
      >
        <ul
          ref={listRef}
          className="max-h-60 overflow-y-auto overflow-x-hidden py-1 rounded-lg custom-select-scrollbar"
          role="listbox"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option.value);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-3 py-2.5 text-sm cursor-pointer transition-colors duration-100 flex items-center justify-between ${
                option.value === value
                  ? isLightMode
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-teal-500/20 text-teal-400'
                  : highlightedIndex === index
                  ? isLightMode
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white/10 text-white'
                  : isLightMode
                  ? 'text-gray-700 hover:bg-gray-50'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <i
                  className={`ri-check-line ${
                    isLightMode ? 'text-emerald-600' : 'text-teal-400'
                  }`}
                ></i>
              )}
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .custom-select-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-select-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
        .custom-select-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
        .custom-select-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
      `}</style>
    </div>,
    document.body
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5 text-left text-sm focus:outline-none transition-all cursor-pointer ${
          isLightMode
            ? 'bg-gray-50 border-gray-300 text-gray-900 hover:border-gray-400 focus:border-emerald-500'
            : 'bg-white/5 border-white/10 text-white hover:border-white/20 focus:border-teal-500'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && (
            <i
              className={`${icon} ${
                isLightMode ? 'text-gray-400' : 'text-white/40'
              }`}
            ></i>
          )}
          <span
            className={
              selectedOption
                ? isLightMode
                  ? 'text-gray-900'
                  : 'text-white'
                : isLightMode
                ? 'text-gray-400'
                : 'text-white/40'
            }
          >
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <i
          className={`ri-arrow-down-s-line transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          } ${isLightMode ? 'text-gray-400' : 'text-white/40'}`}
        ></i>
      </button>

      {/* Portal dropdown */}
      {dropdownPortal}
    </div>
  );
};

export default CustomSelect;
