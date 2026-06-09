import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import CustomSelect from '../../../components/base/CustomSelect';
import {
  getAdminComplaintSummary,
  getAdminComplaintList,
  getAdminComplaintDetail,
  getAdminComplaintInvestigation,
} from '../../../services/admin.service';
import type {
  AdminComplaintSummary,
  AdminComplaintItem,
  AdminComplaintDetail,
  AdminInvestigationData,
} from '../../../services/admin.service';



// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Complaint {
  id: number;
  complainant: {
    name: string;
    email: string;
    role: string;
    avatar: string;
    joinDate: string;
    totalProjects: number;
    rating: number;
  };
  reportedUser: {
    name: string;
    email: string;
    role: string;
    avatar: string;
    joinDate: string;
    totalProjects: number;
    rating: number;
    warnings: number;
    status: 'active' | 'suspended' | 'banned';
  };
  type: string;
  status: string;
  subject: string;
  description: string;
  relatedProject?: {
    name: string;
    budget: number;
    startDate: string;
    deadline: string;
    status: string;
    milestones: { name: string; amount: number; status: string; date: string }[];
  };
  relatedJob?: string;
  evidence: { name: string; type: 'image' | 'file'; url: string }[];
  submittedDate: string;
  adminNotes: { action: string; note: string; admin: string; date: string }[];
  resolution?: string;
  paymentHistory?: { date: string; amount: number; type: string; status: string }[];
  chatLogs?: { sender: string; message: string; date: string }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_IMG_BASE = 'https://nextcoder.runasp.net/';
const buildAvatarUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_IMG_BASE}${path.replace(/^\/+/, '')}`;
};

const toComplaint = (item: AdminComplaintItem): Complaint => ({
  id: item.id,
  complainant: {
    name: item.complainantName,
    email: '',
    role: item.complainantRole,
    avatar: buildAvatarUrl(item.complainantImageUrl),
    joinDate: '',
    totalProjects: 0,
    rating: 0,
  },
  reportedUser: {
    name: item.reportedUserName,
    email: '',
    role: '',
    avatar: buildAvatarUrl(item.reportedUserImageUrl),
    joinDate: '',
    totalProjects: 0,
    rating: 0,
    warnings: 0,
    status: 'active',
  },
  type: item.complaintType,
  status: item.status,
  subject: item.complaintType,
  description: item.description,
  relatedProject: item.projectTitle
    ? { name: item.projectTitle, budget: 0, startDate: '', deadline: '', status: '', milestones: [] }
    : undefined,
  evidence: item.evidenceUrl
    ? [{ name: 'Evidence', type: 'image' as const, url: item.evidenceUrl }]
    : [],
  submittedDate: item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '',
  adminNotes: [],
});

// ---------------------------------------------------------------------------
// Swagger-sourced filter options
//
// Strategy:
//   1. The dropdowns are seeded immediately with FALLBACK_OPTIONS — a snapshot
//      of the enum values taken verbatim from the Swagger schema definitions.
//      This means the UI is fully functional from the very first render.
//
//   2. Once the backend CORS policy is deployed (AllowedOrigins includes the
//      frontend origin), set the environment variable:
//
//        VITE_SWAGGER_CORS_READY=true   (in .env.local or .env.production)
//
//      The component will then fetch the live Swagger JSON on mount and replace
//      FALLBACK_OPTIONS with the current schema values automatically.
//      If the fetch still fails, FALLBACK_OPTIONS are restored — the UI is
//      always usable.
//
//   3. When the backend adds / renames enum values in the future, update
//      FALLBACK_OPTIONS below to stay synchronized.
// ---------------------------------------------------------------------------

const SWAGGER_URL = 'https://nextcoder.runasp.net/swagger/v1/swagger.json';

// Set to "true" in .env.local only after the backend CORS policy is deployed.
const SWAGGER_CORS_READY = import.meta.env.VITE_SWAGGER_CORS_READY === 'true';

interface FilterOption  { value: string; label: string; }
interface FilterOptions {
  status: FilterOption[];
  role:   FilterOption[];
  type:   FilterOption[];
}

const toLabel = (value: string): string =>
  value.replace(/([A-Z])/g, ' $1').trim();

/**
 * Fallback values — copied verbatim from the Swagger schema definitions:
 *   ReportStatus    → Status filter
 *   ReportCreatedBy → Complainant Role filter
 *   ReportType      → Complaint Type filter
 *
 * Update this constant whenever the backend adds or renames enum values.
 */
const FALLBACK_OPTIONS: FilterOptions = {
  // ReportStatus enum
  status: ['Pending', 'UnderReview', 'Resolved', 'Dismissed']
    .map((v) => ({ value: v, label: toLabel(v) })),

  // ReportCreatedBy enum
  role: ['Client', 'Freelancer']
    .map((v) => ({ value: v, label: toLabel(v) })),

  // ReportType enum
  type: [
    'MissedDeadline', 'PoorQuality', 'UnprofessionalBehavior',
    'NonPayment', 'ScopeCreep', 'Unresponsive', 'Harassment',
    'UnclearRequirements', 'Fraud', 'Other',
  ].map((v) => ({ value: v, label: toLabel(v) })),
};

/**
 * Fetches the live Swagger JSON and parses enum values for filter dropdowns.
 * Only called when SWAGGER_CORS_READY is true (i.e. backend CORS is deployed).
 */
const parseSwaggerEnums = async (): Promise<FilterOptions> => {
  const res = await fetch(SWAGGER_URL);
  if (!res.ok) throw new Error('Failed to fetch API schema.');
  const spec = await res.json();
  const schemas = spec?.components?.schemas ?? {};

  const toOptions = (schemaName: string): FilterOption[] => {
    const values: string[] = schemas[schemaName]?.enum ?? [];
    if (values.length === 0) return FALLBACK_OPTIONS[schemaName as keyof FilterOptions] ?? [];
    return values.map((v) => ({ value: v, label: toLabel(v) }));
  };

  return {
    status: toOptions('ReportStatus'),
    role:   toOptions('ReportCreatedBy'),
    type:   toOptions('ReportType'),
  };
};



const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ComplaintsManagement = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showResolutionFlow, setShowResolutionFlow] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [investigationTab, setInvestigationTab] = useState<'profiles' | 'timeline' | 'payments' | 'chat'>('profiles');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [resolutionNote, setResolutionNote] = useState('');
  const [notifyComplainant, setNotifyComplainant] = useState(true);
  const [notifyReported, setNotifyReported] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; label: string } | null>(null);

  // API state — summary
  const [complaintSummary, setComplaintSummary] = useState<AdminComplaintSummary | null>(null);

  // API state — list
  const [apiComplaints, setApiComplaints] = useState<AdminComplaintItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError]     = useState<string | null>(null);
  const [pageNumber, setPageNumber]   = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);

  // Filter options loaded from Swagger schema (seeded with fallback immediately)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(FALLBACK_OPTIONS);

  // Complaint detail (Step 1 — Review)
  const [detailData, setDetailData]       = useState<AdminComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError]     = useState<string | null>(null);

  // Investigation data (Step 2 — Investigate)
  const [investigationData, setInvestigationData]       = useState<AdminInvestigationData | null>(null);
  const [investigationLoading, setInvestigationLoading] = useState(false);
  const [investigationError, setInvestigationError]     = useState<string | null>(null);

  const prevFilterRef = useRef({ search: '', status: 'all', role: 'all', type: 'all' });



  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Load summary once on mount; optionally sync filter options from live Swagger
  useEffect(() => {
    let active = true;
    getAdminComplaintSummary()
      .then((data) => { if (active) setComplaintSummary(data); })
      .catch(() => {});

    // Only attempt the live Swagger fetch after backend CORS is deployed.
    // Set VITE_SWAGGER_CORS_READY=true in .env.local / .env.production once ready.
    if (SWAGGER_CORS_READY) {
      parseSwaggerEnums()
        .then((opts) => { if (active) setFilterOptions(opts); })
        .catch(() => { if (active) setFilterOptions(FALLBACK_OPTIONS); });
    }

    return () => { active = false; };
  }, []);

  // Load list when filters or page changes
  useEffect(() => {
    let active = true;
    const prev = prevFilterRef.current;
    const filtersChanged =
      prev.search !== debouncedSearch ||
      prev.status !== statusFilter ||
      prev.role   !== roleFilter ||
      prev.type   !== typeFilter;

    const effectivePage = filtersChanged ? 1 : pageNumber;
    if (filtersChanged) {
      prevFilterRef.current = { search: debouncedSearch, status: statusFilter, role: roleFilter, type: typeFilter };
      if (pageNumber !== 1) { setPageNumber(1); return; }
    }

    setListLoading(true);
    setListError(null);

    getAdminComplaintList({
      Search:          debouncedSearch || undefined,
      Status:          statusFilter !== 'all' ? statusFilter : undefined,
      ComplainantRole: roleFilter   !== 'all' ? roleFilter   : undefined,
      ComplaintType:   typeFilter   !== 'all' ? typeFilter   : undefined,
      PageNumber: effectivePage,
      PageSize:   PAGE_SIZE,
    })
      .then((data) => {
        if (!active) return;
        setApiComplaints(data.items);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        if (active) setListError(err instanceof Error ? err.message : 'Failed to load complaints.');
      })
      .finally(() => { if (active) setListLoading(false); });

    return () => { active = false; };
  }, [debouncedSearch, statusFilter, roleFilter, typeFilter, pageNumber]);

  // Map API items → UI Complaint shape
  const complaints = apiComplaints.map(toComplaint);
  const filteredComplaints = complaints;

  // Labels — raw string from API is used as fallback
  const typeLabels: Record<string, string> = {};
  const statusLabels: Record<string, string> = {};

  // Summary card values
  const stats = {
    total:      complaintSummary?.totalComplaints ?? 0,
    pending:    complaintSummary?.pending         ?? 0,
    inProgress: complaintSummary?.inProgress      ?? 0,
    resolved:   complaintSummary?.resolved        ?? 0,
  };

  const actionOptions = [
    { id: 'warn',           label: 'Warn User',            icon: 'ri-alarm-warning-line',       color: 'orange', description: 'Send a formal warning to the reported user' },
    { id: 'suspend_temp',   label: 'Suspend Temporarily',  icon: 'ri-user-unfollow-line',        color: 'yellow', description: 'Suspend user account for 30 days' },
    { id: 'ban',            label: 'Permanently Ban',       icon: 'ri-user-forbid-line',          color: 'red',    description: 'Permanently ban user from the platform' },
    { id: 'refund',         label: 'Refund Payment',        icon: 'ri-refund-2-line',             color: 'teal',   description: 'Refund payment to the complainant' },
    { id: 'release',        label: 'Release Payment',       icon: 'ri-money-dollar-circle-line',  color: 'green',  description: 'Release held payment to the freelancer' },
    { id: 'cancel_project', label: 'Cancel Project',        icon: 'ri-close-circle-line',         color: 'pink',   description: 'Cancel the related project' },
  ];

  // Helper to load investigation data for Step 2
  const loadInvestigation = (reportId: number) => {
    setInvestigationData(null);
    setInvestigationLoading(true);
    setInvestigationError(null);
    getAdminComplaintInvestigation(reportId)
      .then((d) => setInvestigationData(d))
      .catch((err) => setInvestigationError(err instanceof Error ? err.message : 'Failed to load investigation data.'))
      .finally(() => setInvestigationLoading(false));
  };

  const openResolutionFlow = (complaint: Complaint) => {

    setSelectedComplaint(complaint);
    setShowResolutionFlow(true);
    setCurrentStep(1);
    setSelectedActions([]);
    setResolutionNote('');
    setInvestigationTab('profiles');
    // Fetch full detail for the Review step
    setDetailData(null);
    setDetailLoading(true);
    setDetailError(null);
    getAdminComplaintDetail(complaint.id)
      .then((d) => { setDetailData(d); })
      .catch((err) => { setDetailError(err instanceof Error ? err.message : 'Failed to load complaint details.'); })
      .finally(() => { setDetailLoading(false); });
  };


  const toggleAction = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId) ? prev.filter((a) => a !== actionId) : [...prev, actionId]
    );
  };

  const handleConfirmAction = (action: { type: string; label: string }) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    if (!confirmAction || !selectedComplaint) return;
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleResolve = (status: 'resolved' | 'rejected') => {
    if (!selectedComplaint || !resolutionNote.trim()) return;
    setShowResolutionFlow(false);
    setSelectedComplaint(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':      return 'bg-orange-500/20 text-orange-400';
      case 'underreview':
      case 'in_progress':  return 'bg-blue-500/20 text-blue-400';
      case 'resolved':     return 'bg-green-500/20 text-green-400';
      case 'dismissed':
      case 'rejected':     return 'bg-red-500/20 text-red-400';
      default:             return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'paymentissue':  return 'bg-yellow-500/20 text-yellow-400';
      case 'projectdelay':  return 'bg-orange-500/20 text-orange-400';
      case 'fraud':         return 'bg-red-500/20 text-red-400';
      case 'harassment':    return 'bg-pink-500/20 text-pink-400';
      default:              return 'bg-gray-500/20 text-gray-400';
    }
  };

  const steps = [
    { number: 1, title: 'Review',     icon: 'ri-file-search-line'   },
    { number: 2, title: 'Investigate', icon: 'ri-search-eye-line'   },
    { number: 3, title: 'Take Action', icon: 'ri-hammer-line'       },
    { number: 4, title: 'Resolve',    icon: 'ri-check-double-line'  },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-500/20 rounded-xl">
              <i className="ri-file-list-3-line text-2xl text-teal-400"></i>
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Complaints</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-500/20 rounded-xl">
              <i className="ri-time-line text-2xl text-orange-400"></i>
            </div>
            <div>
              <p className="text-white/60 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-500/20 rounded-xl">
              <i className="ri-loader-4-line text-2xl text-blue-400"></i>
            </div>
            <div>
              <p className="text-white/60 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-green-500/20 rounded-xl">
              <i className="ri-check-double-line text-2xl text-green-400"></i>
            </div>
            <div>
              <p className="text-white/60 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Search</label>
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Status</label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                ...filterOptions.status,
              ]}
              placeholder="All Status"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Complainant Role</label>
            <CustomSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'All Roles' },
                ...filterOptions.role,
              ]}
              placeholder="All Roles"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Complaint Type</label>
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                ...filterOptions.type,
              ]}
              placeholder="All Types"
            />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {listLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="h-32 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))
        ) : listError ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-red-500/20">
            <i className="ri-error-warning-line text-5xl text-red-400/40 mb-4 block"></i>
            <p className="text-red-400 text-sm">{listError}</p>
          </div>
        ) : (
          <>
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{complaint.subject}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(complaint.status)}`}>
                            {statusLabels[complaint.status] ?? complaint.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getTypeColor(complaint.type)}`}>
                            {typeLabels[complaint.type] ?? complaint.type}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm line-clamp-2">{complaint.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/10">
                          {complaint.complainant.avatar ? (
                            <img src={complaint.complainant.avatar} alt="" className="w-full h-full object-cover object-top" />
                          ) : (
                            <i className="ri-user-line text-white/40 text-sm"></i>
                          )}
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Complainant</p>
                          <p className="text-white">{complaint.complainant.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/10">
                          {complaint.reportedUser.avatar ? (
                            <img src={complaint.reportedUser.avatar} alt="" className="w-full h-full object-cover object-top" />
                          ) : (
                            <i className="ri-user-line text-white/40 text-sm"></i>
                          )}
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Reported User</p>
                          <p className="text-white">{complaint.reportedUser.name}</p>
                        </div>
                      </div>
                      {(complaint.relatedProject || complaint.relatedJob) && (
                        <div>
                          <p className="text-white/40 text-xs">{complaint.relatedProject ? 'Related Project' : 'Related Job'}</p>
                          <p className="text-teal-400">{complaint.relatedProject?.name || complaint.relatedJob}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-white/40 text-xs">Submitted</p>
                        <p className="text-white/60">{complaint.submittedDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openResolutionFlow(complaint)}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap text-sm font-semibold"
                    >
                      <i className="ri-file-search-line mr-1"></i>
                      {complaint.status === 'Resolved' || complaint.status === 'Dismissed' ? 'View Case' : 'Handle Case'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredComplaints.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <i className="ri-file-search-line text-5xl text-white/20 mb-4 block"></i>
                <p className="text-white/40">No complaints found</p>
              </div>
            )}

            {/* Pagination */}
            {!listLoading && !listError && totalPages > 1 && (
              <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-4 bg-white/5 rounded-xl">
                <p className="text-white/40 text-xs sm:text-sm">{totalCount.toLocaleString()} complaints</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPageNumber(1)}
                    disabled={pageNumber === 1}
                    className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                    title="First page"
                  >
                    <i className="ri-skip-left-line"></i>
                  </button>
                  <button
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-white/40 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPageNumber(p as number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                              pageNumber === p
                                ? 'bg-teal-500 text-white'
                                : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>
                  <button
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNumber === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                  <button
                    onClick={() => setPageNumber(totalPages)}
                    disabled={pageNumber === totalPages}
                    className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs"
                    title="Last page"
                  >
                    <i className="ri-skip-right-line"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Resolution Flow Modal */}
      {showResolutionFlow && selectedComplaint && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-[#1a1f37] rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-white/10 flex flex-col">
            {/* Header with Steps */}
            <div className="p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Complaint Resolution</h3>
                <button
                  onClick={() => setShowResolutionFlow(false)}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div
                      onClick={() => {
                        if (selectedComplaint.status === 'Resolved' || selectedComplaint.status === 'Dismissed') return;
                        if (step.number === 2 && !investigationData && !investigationLoading) {
                          loadInvestigation(selectedComplaint.id);
                        }
                        setCurrentStep(step.number);
                      }}
                      className={`flex items-center gap-3 cursor-pointer transition-all ${
                        currentStep >= step.number ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          currentStep > step.number
                            ? 'bg-green-500'
                            : currentStep === step.number
                            ? 'bg-teal-500'
                            : 'bg-white/10'
                        }`}
                      >
                        {currentStep > step.number ? (
                          <i className="ri-check-line text-2xl"></i>
                        ) : (
                          <i className={`${step.icon} text-2xl`}></i>
                        )}
                      </div>
                      <span className={`font-semibold hidden sm:block ${
                        currentStep === step.number ? 'text-white' : 'text-white/60'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-white/10'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Review */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-500/20 rounded-lg">
                      <i className="ri-file-search-line text-xl text-teal-400"></i>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Complaint Review</h4>
                      <p className="text-white/60 text-sm">Review the complaint details and evidence</p>
                    </div>
                  </div>

                  {/* Loading skeleton */}
                  {detailLoading && (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-40 rounded-xl bg-white/5 border border-white/10" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-28 rounded-xl bg-white/5 border border-white/10" />
                        <div className="h-28 rounded-xl bg-white/5 border border-white/10" />
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {!detailLoading && detailError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                      <i className="ri-error-warning-line text-4xl text-red-400 mb-3 block"></i>
                      <p className="text-red-400 text-sm">{detailError}</p>
                      <button
                        onClick={() => {
                          if (!selectedComplaint) return;
                          setDetailLoading(true);
                          setDetailError(null);
                          getAdminComplaintDetail(selectedComplaint.id)
                            .then((d) => setDetailData(d))
                            .catch((e) => setDetailError(e instanceof Error ? e.message : 'Failed to load.'))
                            .finally(() => setDetailLoading(false));
                        }}
                        className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all cursor-pointer"
                      >
                        <i className="ri-refresh-line mr-1"></i> Retry
                      </button>
                    </div>
                  )}

                  {/* Live data */}
                  {!detailLoading && !detailError && detailData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left column */}
                      <div className="space-y-4">
                        {/* Report info card */}
                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-white">{detailData.reportType}</h5>
                            <div className="flex gap-2 flex-wrap justify-end">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(detailData.status)}`}>
                                {detailData.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(detailData.reportType)}`}>
                                {toLabel(detailData.reportType)}
                              </span>
                            </div>
                          </div>
                          <p className="text-white/70 leading-relaxed">{detailData.description}</p>
                          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-sm text-white/50">
                            <span>
                              <i className="ri-calendar-line mr-1"></i>
                              {detailData.createdAt
                                ? new Date(detailData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '—'}
                            </span>
                            <span>
                              <i className="ri-attachment-line mr-1"></i>
                              {detailData.evidenceUrl ? '1 attachment' : 'No attachments'}
                            </span>
                          </div>
                        </div>

                        {/* Complainant + Reported user mini cards */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Complainant */}
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-white/50 text-xs mb-3 uppercase tracking-wider">Complainant</p>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                                {detailData.complainant.imageUrl ? (
                                  <img src={buildAvatarUrl(detailData.complainant.imageUrl)} alt="" className="w-full h-full object-cover object-top" />
                                ) : (
                                  <i className="ri-user-line text-white/40"></i>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold truncate">{detailData.complainant.fullName}</p>
                                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded text-xs font-semibold">{detailData.complainant.role}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-white font-bold text-sm">{detailData.complainant.totalProjects}</p>
                                <p className="text-white/40 text-xs">Projects</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-white font-bold text-sm">{detailData.complainant.rating ?? '—'}</p>
                                <p className="text-white/40 text-xs">Rating</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-orange-400 font-bold text-sm">{detailData.complainant.warningsCount}</p>
                                <p className="text-white/40 text-xs">Warnings</p>
                              </div>
                            </div>
                            {detailData.complainant.email && (
                              <p className="text-white/40 text-xs mt-3 truncate">
                                <i className="ri-mail-line mr-1"></i>{detailData.complainant.email}
                              </p>
                            )}
                            {detailData.complainant.joinedAt && (
                              <p className="text-white/40 text-xs mt-1">
                                <i className="ri-calendar-line mr-1"></i>
                                Joined {new Date(detailData.complainant.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>

                          {/* Reported user */}
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-white/50 text-xs mb-3 uppercase tracking-wider">Reported User</p>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                                {detailData.reportedUser.imageUrl ? (
                                  <img src={buildAvatarUrl(detailData.reportedUser.imageUrl)} alt="" className="w-full h-full object-cover object-top" />
                                ) : (
                                  <i className="ri-user-line text-white/40"></i>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-semibold truncate">{detailData.reportedUser.fullName}</p>
                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">{detailData.reportedUser.role}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-white font-bold text-sm">{detailData.reportedUser.totalProjects}</p>
                                <p className="text-white/40 text-xs">Projects</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-white font-bold text-sm">{detailData.reportedUser.rating ?? '—'}</p>
                                <p className="text-white/40 text-xs">Rating</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-orange-400 font-bold text-sm">{detailData.reportedUser.warningsCount}</p>
                                <p className="text-white/40 text-xs">Warnings</p>
                              </div>
                            </div>
                            {detailData.reportedUser.email && (
                              <p className="text-white/40 text-xs mt-3 truncate">
                                <i className="ri-mail-line mr-1"></i>{detailData.reportedUser.email}
                              </p>
                            )}
                            {detailData.reportedUser.joinedAt && (
                              <p className="text-white/40 text-xs mt-1">
                                <i className="ri-calendar-line mr-1"></i>
                                Joined {new Date(detailData.reportedUser.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Related project */}
                        {detailData.project && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-white/50 text-xs mb-3 uppercase tracking-wider">Related Project</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-teal-400 font-semibold">{detailData.project.title}</p>
                                <p className="text-white/50 text-sm">Budget: ${detailData.project.budget.toLocaleString()}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                detailData.project.status?.toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {detailData.project.status}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right column — Evidence */}
                      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                        <h5 className="text-lg font-semibold text-white mb-4">
                          <i className="ri-attachment-line mr-2 text-teal-400"></i>
                          Evidence &amp; Attachments
                        </h5>
                        {detailData.evidenceUrl ? (
                          <div className="space-y-4">
                            <div className="bg-white/5 rounded-lg overflow-hidden">
                              {/* Render as image if common image extension, otherwise as file download */}
                              {/\.(jpe?g|png|gif|webp|svg)$/i.test(detailData.evidenceUrl) ? (
                                <div>
                                  <div className="w-full h-48">
                                    <img
                                      src={buildAvatarUrl(detailData.evidenceUrl)}
                                      alt="Evidence"
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  </div>
                                  <div className="p-3 flex items-center justify-between">
                                    <span className="text-white/60 text-sm truncate">Evidence</span>
                                    <a
                                      href={buildAvatarUrl(detailData.evidenceUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-teal-400 hover:text-teal-300"
                                    >
                                      <i className="ri-external-link-line"></i>
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
                                      <i className="ri-file-line text-xl text-teal-400"></i>
                                    </div>
                                    <span className="text-white truncate">Evidence File</span>
                                  </div>
                                  <a
                                    href={buildAvatarUrl(detailData.evidenceUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-400 hover:text-teal-300"
                                  >
                                    <i className="ri-download-line"></i>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/40 text-center py-8">No evidence attached</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Investigate */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-500/20 rounded-lg">
                      <i className="ri-search-eye-line text-xl text-teal-400"></i>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Investigation</h4>
                      <p className="text-white/60 text-sm">Review user profiles, project timeline and payment history</p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit flex-wrap">
                    {([
                      { id: 'profiles', label: 'User Profiles',    icon: 'ri-user-line' },
                      { id: 'timeline', label: 'Project Timeline', icon: 'ri-time-line' },
                      { id: 'payments', label: 'Payment History',  icon: 'ri-money-dollar-circle-line' },
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setInvestigationTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                          investigationTab === tab.id
                            ? 'bg-teal-500 text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <i className={tab.icon}></i>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Loading skeleton */}
                  {investigationLoading && (
                    <div className="space-y-4 animate-pulse">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-48 rounded-xl bg-white/5 border border-white/10" />
                        <div className="h-48 rounded-xl bg-white/5 border border-white/10" />
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {!investigationLoading && investigationError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                      <i className="ri-error-warning-line text-4xl text-red-400 mb-3 block"></i>
                      <p className="text-red-400 text-sm">{investigationError}</p>
                      <button
                        onClick={() => selectedComplaint && loadInvestigation(selectedComplaint.id)}
                        className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all cursor-pointer"
                      >
                        <i className="ri-refresh-line mr-1"></i> Retry
                      </button>
                    </div>
                  )}

                  {/* Live investigation content */}
                  {!investigationLoading && !investigationError && investigationData && (
                    <>
                      {/* ── USER PROFILES ────────────────────────────────────────── */}
                      {investigationTab === 'profiles' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Complainant */}
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center gap-2 mb-5">
                              <i className="ri-user-line text-teal-400"></i>
                              <h5 className="text-lg font-semibold text-white">Complainant Profile</h5>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                                {investigationData.complainant?.imageUrl ? (
                                  <img src={buildAvatarUrl(investigationData.complainant.imageUrl)} alt="" className="w-full h-full object-cover object-top" />
                                ) : (
                                  <i className="ri-user-line text-white/40 text-2xl"></i>
                                )}
                              </div>
                              <div>
                                <p className="text-xl font-bold text-white">{investigationData.complainant?.fullName ?? '—'}</p>
                                <p className="text-white/60 text-sm">{investigationData.complainant?.email ?? ''}</p>
                                <span className="mt-2 inline-block px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold">
                                  {investigationData.complainant?.role ?? '—'}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-white">{investigationData.complainant?.totalProjects ?? 0}</p>
                                <p className="text-white/50 text-xs">Projects</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-white">{investigationData.complainant?.rating ?? '—'}</p>
                                <p className="text-white/50 text-xs">Rating</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-orange-400">{investigationData.complainant?.warningsCount ?? 0}</p>
                                <p className="text-white/50 text-xs">Warnings</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs font-bold text-white">
                                  {investigationData.complainant?.joinedAt
                                    ? new Date(investigationData.complainant.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                    : '—'}
                                </p>
                                <p className="text-white/50 text-xs">Joined</p>
                              </div>
                            </div>
                          </div>

                          {/* Reported user */}
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center gap-2 mb-5">
                              <i className="ri-user-warning-line text-orange-400"></i>
                              <h5 className="text-lg font-semibold text-white">Reported User Profile</h5>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                                {investigationData.reportedUser?.imageUrl ? (
                                  <img src={buildAvatarUrl(investigationData.reportedUser.imageUrl)} alt="" className="w-full h-full object-cover object-top" />
                                ) : (
                                  <i className="ri-user-line text-white/40 text-2xl"></i>
                                )}
                              </div>
                              <div>
                                <p className="text-xl font-bold text-white">{investigationData.reportedUser?.fullName ?? '—'}</p>
                                <p className="text-white/60 text-sm">{investigationData.reportedUser?.email ?? ''}</p>
                                <span className="mt-2 inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">
                                  {investigationData.reportedUser?.role ?? '—'}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-white">{investigationData.reportedUser?.totalProjects ?? 0}</p>
                                <p className="text-white/50 text-xs">Projects</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-white">{investigationData.reportedUser?.rating ?? '—'}</p>
                                <p className="text-white/50 text-xs">Rating</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-orange-400">{investigationData.reportedUser?.warningsCount ?? 0}</p>
                                <p className="text-white/50 text-xs">Warnings</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <p className="text-xs font-bold text-white">
                                  {investigationData.reportedUser?.joinedAt
                                    ? new Date(investigationData.reportedUser.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                    : '—'}
                                </p>
                                <p className="text-white/50 text-xs">Joined</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── PROJECT TIMELINE ────────────────────────────────────── */}
                      {investigationTab === 'timeline' && (
                        investigationData.project ? (
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            {/* Project header */}
                            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                              <div>
                                <h5 className="text-lg font-semibold text-white">{investigationData.project.title}</h5>
                                <p className="text-white/50 text-sm">Budget: ${investigationData.project.budget.toLocaleString()}</p>
                              </div>
                              <div className="text-right text-sm text-white/50">
                                {investigationData.project.createdAt && (
                                  <p>Started: {new Date(investigationData.project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                )}
                                {investigationData.project.deadline && (
                                  <p>Deadline: {new Date(investigationData.project.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                )}
                              </div>
                            </div>

                            {/* Milestones timeline */}
                            {(investigationData.project.milestones ?? []).length === 0 ? (
                              <div className="text-center py-8">
                                <i className="ri-roadster-line text-5xl text-white/20 mb-3 block"></i>
                                <p className="text-white/40">No milestones available</p>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10"></div>
                                <div className="space-y-6">
                                  {investigationData.project.milestones.map((ms) => {
                                    const isDone = ms.status?.toLowerCase() === 'completed';
                                    const isActive = ms.status?.toLowerCase() === 'inprogress' || ms.status?.toLowerCase() === 'in progress';
                                    return (
                                      <div key={ms.milestoneId} className="relative flex items-start gap-4 pl-12">
                                        <div className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                          isDone   ? 'bg-green-500 border-green-500' :
                                          isActive ? 'bg-blue-500 border-blue-500' :
                                          'bg-white/10 border-white/30'
                                        }`}>
                                          {isDone && <i className="ri-check-line text-white text-xs"></i>}
                                        </div>
                                        <div className="flex-1 bg-white/5 rounded-lg p-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <h6 className="font-semibold text-white">{ms.title}</h6>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                              isDone   ? 'bg-green-500/20 text-green-400' :
                                              isActive ? 'bg-blue-500/20 text-blue-400' :
                                              'bg-white/10 text-white/50'
                                            }`}>
                                              {ms.status}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-white/50">
                                              Due: {ms.dueDate
                                                ? new Date(ms.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '—'}
                                            </span>
                                            <span className="text-teal-400 font-semibold">${ms.amount.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
                            <i className="ri-calendar-line text-5xl text-white/20 mb-4 block"></i>
                            <p className="text-white/40">No project timeline available for this complaint</p>
                          </div>
                        )
                      )}

                      {/* ── PAYMENT HISTORY ─────────────────────────────────────── */}
                      {investigationTab === 'payments' && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h5 className="text-lg font-semibold text-white mb-4">Payment History</h5>
                          {(investigationData.payments ?? []).length === 0 ? (
                            <div className="text-center py-8">
                              <i className="ri-money-dollar-circle-line text-5xl text-white/20 mb-4 block"></i>
                              <p className="text-white/40">No payments available</p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-white/50 text-sm font-semibold">Date</th>
                                    <th className="text-left py-3 px-4 text-white/50 text-sm font-semibold">Type</th>
                                    <th className="text-right py-3 px-4 text-white/50 text-sm font-semibold">Amount</th>
                                    <th className="text-right py-3 px-4 text-white/50 text-sm font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {investigationData.payments.map((pay, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                      <td className="py-3 px-4 text-white text-sm">
                                        {pay.date ? new Date(pay.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                      </td>
                                      <td className="py-3 px-4 text-white/70 text-sm">{pay.type ?? '—'}</td>
                                      <td className="py-3 px-4 text-right text-teal-400 font-semibold text-sm">${(pay.amount ?? 0).toLocaleString()}</td>
                                      <td className="py-3 px-4 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                          pay.status?.toLowerCase() === 'released'   ? 'bg-green-500/20 text-green-400' :
                                          pay.status?.toLowerCase().includes('escrow') ? 'bg-yellow-500/20 text-yellow-400' :
                                          pay.status?.toLowerCase().includes('approv') ? 'bg-blue-500/20 text-blue-400' :
                                          'bg-white/10 text-white/50'
                                        }`}>
                                          {pay.status ?? '—'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Take Action */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-500/20 rounded-lg">
                      <i className="ri-hammer-line text-xl text-teal-400"></i>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Take Action</h4>
                      <p className="text-white/60 text-sm">Select one or more actions to take against the reported user</p>
                    </div>
                  </div>

                  {selectedComplaint.status === 'Resolved' || selectedComplaint.status === 'Dismissed' ? (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                      <i className="ri-lock-line text-5xl text-white/20 mb-4 block"></i>
                      <p className="text-white/60">This case has been closed. No further actions can be taken.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {actionOptions.map((action) => (
                        <div
                          key={action.id}
                          onClick={() => toggleAction(action.id)}
                          className={`bg-white/5 rounded-xl p-5 border cursor-pointer transition-all ${
                            selectedActions.includes(action.id)
                              ? `border-${action.color}-500 bg-${action.color}-500/10`
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-${action.color}-500/20`}>
                              <i className={`${action.icon} text-2xl text-${action.color}-400`}></i>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedActions.includes(action.id)
                                ? `border-${action.color}-500 bg-${action.color}-500`
                                : 'border-white/30'
                            }`}>
                              {selectedActions.includes(action.id) && (
                                <i className="ri-check-line text-white text-sm"></i>
                              )}
                            </div>
                          </div>
                          <h5 className="text-white font-semibold mb-1">{action.label}</h5>
                          <p className="text-white/50 text-sm">{action.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedActions.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <i className="ri-alarm-warning-line text-orange-400 text-xl mt-0.5"></i>
                        <div>
                          <p className="text-orange-400 font-semibold">Selected Actions ({selectedActions.length})</p>
                          <p className="text-white/60 text-sm mt-1">
                            {selectedActions.map((id) => actionOptions.find((a) => a.id === id)?.label).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Resolve */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-500/20 rounded-lg">
                      <i className="ri-check-double-line text-xl text-teal-400"></i>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Resolution</h4>
                      <p className="text-white/60 text-sm">Write your resolution note and notify the users</p>
                    </div>
                  </div>

                  {selectedComplaint.status === 'Resolved' || selectedComplaint.status === 'Dismissed' ? (
                    <div className="space-y-6">
                      <div className={`rounded-xl p-6 border ${
                        selectedComplaint.status === 'Resolved'
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                            selectedComplaint.status === 'Resolved' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            <i className={`${selectedComplaint.status === 'Resolved' ? 'ri-check-line' : 'ri-close-line'} text-2xl text-white`}></i>
                          </div>
                          <div>
                            <h5 className="text-xl font-bold text-white">
                              Case {selectedComplaint.status === 'Resolved' ? 'Resolved' : 'Dismissed'}
                            </h5>
                            <p className="text-white/60 text-sm">This complaint has been closed</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Resolution Note</p>
                          <p className="text-white">{selectedComplaint.resolution}</p>
                        </div>
                      </div>

                      {selectedComplaint.adminNotes.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h5 className="text-lg font-semibold text-white mb-4">
                            <i className="ri-history-line mr-2 text-teal-400"></i>
                            Activity Timeline
                          </h5>
                          <div className="space-y-4">
                            {selectedComplaint.adminNotes.map((note, index) => (
                              <div key={index} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                                  <i className="ri-user-line text-teal-400 text-sm"></i>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-teal-400 text-sm font-semibold">{note.action}</span>
                                    <span className="text-white/40 text-xs">{note.date}</span>
                                  </div>
                                  <p className="text-white/70 text-sm">{note.note}</p>
                                  <p className="text-white/40 text-xs mt-1">By {note.admin}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Resolution Note */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <label className="block text-white font-semibold mb-3">Resolution Note</label>
                        <textarea
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="Write a detailed resolution note explaining your decision and actions taken..."
                          rows={5}
                          maxLength={500}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-500 text-sm resize-none"
                        />
                        <p className="text-white/40 text-xs mt-2 text-right">{resolutionNote.length}/500</p>
                      </div>

                      {/* Notification Options */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h5 className="text-white font-semibold mb-4">
                          <i className="ri-notification-3-line mr-2 text-teal-400"></i>
                          User Notifications
                        </h5>
                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifyComplainant}
                              onChange={(e) => setNotifyComplainant(e.target.checked)}
                              className="w-5 h-5 rounded border-white/30 bg-white/5 text-teal-500 focus:ring-teal-500 cursor-pointer"
                            />
                            <div>
                              <p className="text-white">Notify Complainant</p>
                              <p className="text-white/50 text-sm">Send notification to {selectedComplaint.complainant.name}</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifyReported}
                              onChange={(e) => setNotifyReported(e.target.checked)}
                              className="w-5 h-5 rounded border-white/30 bg-white/5 text-teal-500 focus:ring-teal-500 cursor-pointer"
                            />
                            <div>
                              <p className="text-white">Notify Reported User</p>
                              <p className="text-white/50 text-sm">Send notification to {selectedComplaint.reportedUser.name}</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifyEmail}
                              onChange={(e) => setNotifyEmail(e.target.checked)}
                              className="w-5 h-5 rounded border-white/30 bg-white/5 text-teal-500 focus:ring-teal-500 cursor-pointer"
                            />
                            <div>
                              <p className="text-white">Send Email Notifications</p>
                              <p className="text-white/50 text-sm">Also send notifications via email</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 shrink-0">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Previous
                </button>

                <div className="flex gap-3">
                  {currentStep === 4 && selectedComplaint.status !== 'Resolved' && selectedComplaint.status !== 'Dismissed' && (
                    <>
                      <button
                        onClick={() => handleConfirmAction({ type: 'reject', label: 'Reject Complaint' })}
                        disabled={!resolutionNote.trim()}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="ri-close-line mr-2"></i>
                        Reject Complaint
                      </button>
                      <button
                        onClick={() => handleConfirmAction({ type: 'resolve', label: 'Resolve Complaint' })}
                        disabled={!resolutionNote.trim()}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="ri-check-line mr-2"></i>
                        Resolve Complaint
                      </button>
                    </>
                  )}

                  {currentStep < 4 && (
                    <button
                      onClick={() => {
                        const next = currentStep + 1;
                        if (next === 2 && !investigationData && !investigationLoading) {
                          loadInvestigation(selectedComplaint!.id);
                        }
                        setCurrentStep(next);
                      }}
                      className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Next Step
                      <i className="ri-arrow-right-line ml-2"></i>
                    </button>
                  )}

                  {currentStep === 4 && (selectedComplaint.status === 'Resolved' || selectedComplaint.status === 'Dismissed') && (
                    <button
                      onClick={() => setShowResolutionFlow(false)}
                      className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Close
                      <i className="ri-close-line ml-2"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      , document.body)}


      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && selectedComplaint && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-md w-full border border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  confirmAction.type === 'resolve' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <i className={`${confirmAction.type === 'resolve' ? 'ri-check-line' : 'ri-close-line'} text-3xl text-white`}></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Confirm Action</h3>
              <p className="text-white/60 text-center mb-6">
                Are you sure you want to <span className={confirmAction.type === 'resolve' ? 'text-green-400' : 'text-red-400'}>{confirmAction.label.toLowerCase()}</span>?
                {selectedActions.length > 0 && (
                  <span className="block mt-2 text-orange-400">
                    {selectedActions.length} action(s) will be executed.
                  </span>
                )}
              </p>

              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Resolution Note</p>
                <p className="text-white text-sm">{resolutionNote}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleResolve(confirmAction.type as 'resolved' | 'rejected');
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    confirmAction.type === 'resolve'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}

    </div>
  );
};

export default ComplaintsManagement;
