import { useEffect, useRef, useState } from 'react';
import type { CompanyInfo } from '../../services/company.service';
import { getEmployerCompanies } from '../../services/company.service';
import { useTheme } from '../../contexts/ThemeContext';

interface CompanySelectProps {
  employerId: string | null | undefined;
  value: string; // company name or ID
  onChange: (companyName: string, company?: CompanyInfo) => void;
  isLightMode: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const CompanySelect = ({
  employerId,
  value,
  onChange,
  isLightMode,
  disabled = false,
  placeholder = 'Select a company',
}: CompanySelectProps) => {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCompany = companies.find(
    (c) => c.name === value || String(c.id) === value
  );

  // Fetch companies when employerId is provided
  useEffect(() => {
    if (!employerId) {
      setCompanies([]);
      setError('');
      return;
    }

    const loadCompanies = async () => {
      setIsLoading(true);
      setError('');
      try {
        const companiesData = await getEmployerCompanies(employerId);
        setCompanies(companiesData);

        if (companiesData.length === 0) {
          setError('No companies found. Please add a company in your profile.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companies.');
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, [employerId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (company: CompanyInfo) => {
    onChange(company.name, company);
    setIsOpen(false);
  };

  const inputCls = isLightMode
    ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'
    : 'bg-white/5 border-white/10 text-white placeholder-gray-500';

  const labelCls = isLightMode ? 'text-gray-700' : 'text-white';

  return (
    <div ref={dropdownRef} className="relative">
      {/* Display area */}
      <button
        type="button"
        disabled={disabled || isLoading || companies.length === 0}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 flex items-center justify-between cursor-pointer transition-colors ${
          disabled || isLoading || companies.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-teal-500/50'
        } ${inputCls}`}
      >
        <div className="flex items-center gap-3 flex-1">
          {selectedCompany?.logoUrl ? (
            <img
              src={selectedCompany.logoUrl}
              alt={selectedCompany.name}
              className="w-6 h-6 rounded object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center flex-shrink-0">
              <i className="ri-building-line text-xs text-teal-400"></i>
            </div>
          )}
          <span className="text-left">
            {selectedCompany?.name || placeholder}
          </span>
        </div>
        <i
          className={`ri-arrow-down-s-line transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {/* Error message */}
      {error && (
        <p
          className={`text-xs mt-2 ${
            isLightMode ? 'text-red-600' : 'text-red-400'
          }`}
        >
          {error}
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 rounded-lg border p-3 text-center text-sm ${
            isLightMode
              ? 'bg-white border-gray-200'
              : 'bg-[#1e2442] border-white/10'
          }`}
        >
          <i className="ri-loader-4-line animate-spin mr-2"></i>
          Loading companies...
        </div>
      )}

      {/* Dropdown menu */}
      {isOpen && !isLoading && companies.length > 0 && (
        <div
          className={`absolute top-full left-0 right-0 mt-1 rounded-lg border z-50 max-h-60 overflow-y-auto thin-scrollbar ${
            isLightMode
              ? 'bg-white border-gray-200 shadow-lg'
              : 'bg-[#1e2442] border-white/10 shadow-2xl shadow-black/50'
          }`}
        >
          {companies.map((company) => (
            <button
              key={String(company.id)}
              type="button"
              onClick={() => handleSelect(company)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                selectedCompany?.id === company.id
                  ? isLightMode
                    ? 'bg-teal-50'
                    : 'bg-teal-500/20'
                  : isLightMode
                    ? 'hover:bg-gray-50'
                    : 'hover:bg-white/5'
              }`}
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <i className="ri-building-line text-sm text-teal-400"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isLightMode ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {company.name}
                </p>
              </div>
              {selectedCompany?.id === company.id && (
                <i className="ri-check-line text-teal-500 flex-shrink-0"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanySelect;
