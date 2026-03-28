import { useState } from 'react';
import CustomSelect from '../../../components/base/CustomSelect';

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
  type: 'payment' | 'delay' | 'misuse' | 'harassment' | 'other';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
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

const ComplaintsManagement = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 1,
      complainant: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'client',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20confident%20young%20man%20with%20short%20dark%20hair%20wearing%20navy%20blue%20suit%20and%20white%20shirt%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp1&orientation=squarish',
        joinDate: '2023-06-15',
        totalProjects: 12,
        rating: 4.8,
      },
      reportedUser: {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        role: 'freelancer',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20confident%20woman%20with%20long%20brown%20hair%20wearing%20elegant%20black%20blazer%20and%20white%20blouse%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp2&orientation=squarish',
        joinDate: '2023-03-20',
        totalProjects: 28,
        rating: 4.5,
        warnings: 1,
        status: 'active',
      },
      type: 'delay',
      status: 'pending',
      subject: 'Project Deadline Missed',
      description: 'The freelancer has missed the agreed deadline by 2 weeks without any prior communication. Multiple attempts to contact have been unsuccessful. This has caused significant delays in our product launch.',
      relatedProject: {
        name: 'E-commerce Website Development',
        budget: 5000,
        startDate: '2024-01-15',
        deadline: '2024-03-01',
        status: 'In Progress',
        milestones: [
          { name: 'Design Mockups', amount: 1000, status: 'Completed', date: '2024-01-25' },
          { name: 'Frontend Development', amount: 2000, status: 'Completed', date: '2024-02-10' },
          { name: 'Backend Integration', amount: 1500, status: 'In Progress', date: '2024-02-25' },
          { name: 'Testing & Launch', amount: 500, status: 'Pending', date: '2024-03-01' },
        ],
      },
      evidence: [
        { name: 'contract.pdf', type: 'file', url: '#' },
        { name: 'chat_screenshot.png', type: 'image', url: 'https://readdy.ai/api/search-image?query=screenshot%20of%20chat%20conversation%20showing%20messages%20about%20project%20deadline%20discussion%20on%20messaging%20app%20interface%20clean%20minimal%20design&width=400&height=300&seq=evidence1&orientation=landscape' },
      ],
      submittedDate: '2024-03-15',
      adminNotes: [],
      paymentHistory: [
        { date: '2024-01-15', amount: 1000, type: 'Milestone Payment', status: 'Released' },
        { date: '2024-02-10', amount: 2000, type: 'Milestone Payment', status: 'Released' },
        { date: '2024-02-25', amount: 1500, type: 'Milestone Payment', status: 'Held in Escrow' },
        { date: '2024-03-01', amount: 500, type: 'Final Payment', status: 'Pending' },
      ],
      chatLogs: [
        { sender: 'John Smith', message: 'Hi Sarah, how is the backend integration going?', date: '2024-02-20 10:30' },
        { sender: 'Sarah Johnson', message: 'Making good progress, should be done by Friday.', date: '2024-02-20 11:15' },
        { sender: 'John Smith', message: 'Great! Looking forward to it.', date: '2024-02-20 11:20' },
        { sender: 'John Smith', message: 'Hi Sarah, any updates? Friday has passed.', date: '2024-02-26 09:00' },
        { sender: 'John Smith', message: 'Sarah? Please respond.', date: '2024-02-28 14:30' },
        { sender: 'John Smith', message: 'This is urgent. The deadline was March 1st.', date: '2024-03-02 10:00' },
        { sender: 'John Smith', message: 'I need to escalate this if I dont hear back.', date: '2024-03-05 16:45' },
      ],
    },
    {
      id: 2,
      complainant: {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        role: 'freelancer',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20young%20woman%20with%20blonde%20hair%20in%20bun%20wearing%20burgundy%20blazer%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp3&orientation=squarish',
        joinDate: '2022-11-10',
        totalProjects: 45,
        rating: 4.9,
      },
      reportedUser: {
        name: 'David Wilson',
        email: 'david.w@example.com',
        role: 'client',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20mature%20man%20with%20gray%20hair%20wearing%20charcoal%20suit%20and%20striped%20tie%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp4&orientation=squarish',
        joinDate: '2023-08-05',
        totalProjects: 8,
        rating: 3.2,
        warnings: 2,
        status: 'active',
      },
      type: 'payment',
      status: 'in_progress',
      subject: 'Payment Not Released After Milestone Completion',
      description: 'I completed all milestones as agreed and the client approved them, but the payment has not been released for over 3 weeks. The client is not responding to my messages.',
      relatedProject: {
        name: 'Mobile App Design',
        budget: 3500,
        startDate: '2024-02-01',
        deadline: '2024-02-28',
        status: 'Completed',
        milestones: [
          { name: 'Wireframes', amount: 700, status: 'Completed', date: '2024-02-08' },
          { name: 'UI Design', amount: 1400, status: 'Completed', date: '2024-02-18' },
          { name: 'Prototype', amount: 1000, status: 'Completed', date: '2024-02-25' },
          { name: 'Final Delivery', amount: 400, status: 'Completed', date: '2024-02-28' },
        ],
      },
      evidence: [
        { name: 'milestone_approval.png', type: 'image', url: 'https://readdy.ai/api/search-image?query=screenshot%20of%20project%20management%20dashboard%20showing%20approved%20milestone%20status%20with%20green%20checkmark%20clean%20minimal%20interface%20design&width=400&height=300&seq=evidence2&orientation=landscape' },
        { name: 'payment_history.pdf', type: 'file', url: '#' },
      ],
      submittedDate: '2024-03-12',
      adminNotes: [
        { action: 'Investigation Started', note: 'Contacted client for clarification', admin: 'Admin User', date: '2024-03-13' },
        { action: 'Follow-up', note: 'Awaiting client response', admin: 'Admin User', date: '2024-03-14' },
      ],
      paymentHistory: [
        { date: '2024-02-01', amount: 700, type: 'Milestone Payment', status: 'Held in Escrow' },
        { date: '2024-02-08', amount: 700, type: 'Milestone Payment', status: 'Approved - Not Released' },
        { date: '2024-02-18', amount: 1400, type: 'Milestone Payment', status: 'Approved - Not Released' },
        { date: '2024-02-25', amount: 1000, type: 'Milestone Payment', status: 'Approved - Not Released' },
        { date: '2024-02-28', amount: 400, type: 'Final Payment', status: 'Approved - Not Released' },
      ],
      chatLogs: [
        { sender: 'Emily Davis', message: 'Hi David, all milestones are now complete!', date: '2024-02-28 15:00' },
        { sender: 'David Wilson', message: 'Great work! Ill review and approve.', date: '2024-02-28 16:30' },
        { sender: 'Emily Davis', message: 'Thanks! Please release the payment when ready.', date: '2024-02-28 16:35' },
        { sender: 'Emily Davis', message: 'Hi David, the payment is still pending. Can you release it?', date: '2024-03-05 10:00' },
        { sender: 'Emily Davis', message: 'David? Please respond about the payment.', date: '2024-03-08 14:00' },
        { sender: 'Emily Davis', message: 'This is my third message. I need the payment released.', date: '2024-03-10 09:30' },
      ],
    },
    {
      id: 3,
      complainant: {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        role: 'applicant',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20young%20asian%20man%20with%20black%20hair%20wearing%20gray%20suit%20and%20light%20blue%20shirt%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp5&orientation=squarish',
        joinDate: '2024-01-20',
        totalProjects: 0,
        rating: 0,
      },
      reportedUser: {
        name: 'Tech Solutions Inc.',
        email: 'hr@techsolutions.com',
        role: 'employer',
        avatar: 'https://readdy.ai/api/search-image?query=modern%20tech%20company%20logo%20icon%20abstract%20geometric%20design%20teal%20and%20white%20colors%20on%20dark%20background%20minimalist%20corporate%20branding&width=200&height=200&seq=comp6&orientation=squarish',
        joinDate: '2023-05-10',
        totalProjects: 15,
        rating: 2.1,
        warnings: 3,
        status: 'suspended',
      },
      type: 'misuse',
      status: 'resolved',
      subject: 'Fake Job Posting',
      description: 'This company posted a job that turned out to be a data collection scheme. They asked for personal documents during the application process but never conducted any interviews.',
      relatedJob: 'Senior React Developer',
      evidence: [
        { name: 'job_posting.png', type: 'image', url: 'https://readdy.ai/api/search-image?query=screenshot%20of%20job%20posting%20page%20showing%20developer%20position%20details%20on%20job%20board%20website%20clean%20minimal%20interface&width=400&height=300&seq=evidence3&orientation=landscape' },
        { name: 'email_thread.pdf', type: 'file', url: '#' },
      ],
      submittedDate: '2024-03-08',
      adminNotes: [
        { action: 'Investigation Started', note: 'Investigated job posting', admin: 'Admin User', date: '2024-03-09' },
        { action: 'Evidence Confirmed', note: 'Confirmed fraudulent activity', admin: 'Admin User', date: '2024-03-10' },
        { action: 'User Suspended', note: 'Employer account suspended', admin: 'Admin User', date: '2024-03-10' },
      ],
      resolution: 'Employer account has been permanently suspended. All affected applicants have been notified.',
      chatLogs: [],
      paymentHistory: [],
    },
    {
      id: 4,
      complainant: {
        name: 'Lisa Anderson',
        email: 'lisa.a@example.com',
        role: 'freelancer',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20young%20woman%20with%20red%20hair%20wearing%20teal%20blouse%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp7&orientation=squarish',
        joinDate: '2023-02-14',
        totalProjects: 32,
        rating: 4.7,
      },
      reportedUser: {
        name: 'Robert Brown',
        email: 'robert.b@example.com',
        role: 'client',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20middle%20aged%20man%20with%20brown%20hair%20wearing%20navy%20polo%20shirt%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp8&orientation=squarish',
        joinDate: '2023-09-22',
        totalProjects: 5,
        rating: 3.8,
        warnings: 0,
        status: 'active',
      },
      type: 'harassment',
      status: 'pending',
      subject: 'Inappropriate Messages from Client',
      description: 'The client has been sending inappropriate and unprofessional messages outside of project scope. Despite my requests to keep communication professional, the behavior has continued.',
      relatedProject: {
        name: 'Brand Identity Package',
        budget: 2000,
        startDate: '2024-02-15',
        deadline: '2024-03-15',
        status: 'In Progress',
        milestones: [
          { name: 'Logo Concepts', amount: 500, status: 'Completed', date: '2024-02-22' },
          { name: 'Brand Guidelines', amount: 800, status: 'In Progress', date: '2024-03-05' },
          { name: 'Collateral Design', amount: 700, status: 'Pending', date: '2024-03-15' },
        ],
      },
      evidence: [
        { name: 'messages_screenshot1.png', type: 'image', url: 'https://readdy.ai/api/search-image?query=blurred%20screenshot%20of%20chat%20messages%20on%20messaging%20platform%20interface%20showing%20conversation%20thread%20clean%20minimal%20design&width=400&height=300&seq=evidence4&orientation=landscape' },
        { name: 'messages_screenshot2.png', type: 'image', url: 'https://readdy.ai/api/search-image?query=blurred%20screenshot%20of%20email%20inbox%20showing%20multiple%20messages%20from%20same%20sender%20clean%20minimal%20email%20interface%20design&width=400&height=300&seq=evidence5&orientation=landscape' },
      ],
      submittedDate: '2024-03-14',
      adminNotes: [],
      chatLogs: [
        { sender: 'Robert Brown', message: 'The logo concepts look great!', date: '2024-02-22 14:00' },
        { sender: 'Lisa Anderson', message: 'Thank you! Ill proceed with the brand guidelines.', date: '2024-02-22 14:30' },
        { sender: 'Robert Brown', message: 'You seem really talented. Are you single?', date: '2024-02-23 20:15' },
        { sender: 'Lisa Anderson', message: 'Please keep our communication professional.', date: '2024-02-23 21:00' },
        { sender: 'Robert Brown', message: 'Just trying to be friendly. Whats your Instagram?', date: '2024-02-24 19:30' },
        { sender: 'Lisa Anderson', message: 'I prefer to keep things strictly professional. Please only contact me about the project.', date: '2024-02-24 20:00' },
        { sender: 'Robert Brown', message: 'Come on, dont be so uptight. We could grab coffee sometime.', date: '2024-02-25 21:45' },
      ],
      paymentHistory: [
        { date: '2024-02-15', amount: 500, type: 'Milestone Payment', status: 'Released' },
        { date: '2024-03-05', amount: 800, type: 'Milestone Payment', status: 'Held in Escrow' },
        { date: '2024-03-15', amount: 700, type: 'Final Payment', status: 'Pending' },
      ],
    },
    {
      id: 5,
      complainant: {
        name: 'James Taylor',
        email: 'james.t@example.com',
        role: 'learner',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20portrait%20of%20young%20man%20with%20curly%20hair%20wearing%20casual%20gray%20sweater%20against%20clean%20minimal%20light%20gray%20studio%20background%20corporate%20headshot%20style%20natural%20lighting%20sharp%20focus%20professional%20photography&width=200&height=200&seq=comp9&orientation=squarish',
        joinDate: '2024-02-01',
        totalProjects: 0,
        rating: 0,
      },
      reportedUser: {
        name: 'Course Creator Pro',
        email: 'support@coursecreator.com',
        role: 'employer',
        avatar: 'https://readdy.ai/api/search-image?query=education%20platform%20logo%20icon%20book%20and%20graduation%20cap%20design%20orange%20and%20white%20colors%20on%20dark%20background%20minimalist%20branding&width=200&height=200&seq=comp10&orientation=squarish',
        joinDate: '2022-08-15',
        totalProjects: 50,
        rating: 4.2,
        warnings: 0,
        status: 'active',
      },
      type: 'other',
      status: 'rejected',
      subject: 'Course Content Quality Issue',
      description: 'The course content is outdated and does not match the description. Many videos are from 2019 and the technologies covered are no longer relevant.',
      evidence: [
        { name: 'course_description.png', type: 'image', url: 'https://readdy.ai/api/search-image?query=screenshot%20of%20online%20course%20page%20showing%20course%20description%20and%20curriculum%20details%20clean%20minimal%20learning%20platform%20interface&width=400&height=300&seq=evidence6&orientation=landscape' },
      ],
      submittedDate: '2024-03-05',
      adminNotes: [
        { action: 'Investigation Started', note: 'Reviewed course content', admin: 'Admin User', date: '2024-03-06' },
        { action: 'Complaint Rejected', note: 'Course description accurately reflects content', admin: 'Admin User', date: '2024-03-06' },
      ],
      resolution: 'After review, the course content matches its description. The course is labeled as fundamentals and does not claim to cover the latest technologies. Complaint rejected.',
      chatLogs: [],
      paymentHistory: [],
    },
  ]);

  const typeLabels: Record<string, string> = {
    payment: 'Payment Issue',
    delay: 'Project Delay',
    misuse: 'Misuse',
    harassment: 'Harassment',
    other: 'Other',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };

  const actionOptions = [
    { id: 'warn', label: 'Warn User', icon: 'ri-alarm-warning-line', color: 'orange', description: 'Send a formal warning to the reported user' },
    { id: 'suspend_temp', label: 'Suspend Temporarily', icon: 'ri-user-unfollow-line', color: 'yellow', description: 'Suspend user account for 30 days' },
    { id: 'ban', label: 'Permanently Ban', icon: 'ri-user-forbid-line', color: 'red', description: 'Permanently ban user from the platform' },
    { id: 'refund', label: 'Refund Payment', icon: 'ri-refund-2-line', color: 'teal', description: 'Refund payment to the complainant' },
    { id: 'release', label: 'Release Payment', icon: 'ri-money-dollar-circle-line', color: 'green', description: 'Release held payment to the freelancer' },
    { id: 'cancel_project', label: 'Cancel Project', icon: 'ri-close-circle-line', color: 'pink', description: 'Cancel the related project' },
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.reportedUser.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesRole = roleFilter === 'all' || complaint.complainant.role === roleFilter;
    const matchesType = typeFilter === 'all' || complaint.type === typeFilter;
    return matchesSearch && matchesStatus && matchesRole && matchesType;
  });

  const openResolutionFlow = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowResolutionFlow(true);
    setCurrentStep(1);
    setSelectedActions([]);
    setResolutionNote('');
    setInvestigationTab('profiles');
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

    const timestamp = new Date().toISOString().split('T')[0];
    const newNotes = [...selectedComplaint.adminNotes];

    selectedActions.forEach((actionId) => {
      const action = actionOptions.find((a) => a.id === actionId);
      if (action) {
        newNotes.push({
          action: action.label,
          note: `Action executed: ${action.description}`,
          admin: 'Admin User',
          date: timestamp,
        });
      }
    });

    newNotes.push({
      action: status === 'resolved' ? 'Complaint Resolved' : 'Complaint Rejected',
      note: resolutionNote,
      admin: 'Admin User',
      date: timestamp,
    });

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selectedComplaint.id
          ? {
              ...c,
              status: status,
              adminNotes: newNotes,
              resolution: resolutionNote,
            }
          : c
      )
    );

    setShowResolutionFlow(false);
    setSelectedComplaint(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'delay':
        return 'bg-orange-500/20 text-orange-400';
      case 'misuse':
        return 'bg-red-500/20 text-red-400';
      case 'harassment':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  const steps = [
    { number: 1, title: 'Review', icon: 'ri-file-search-line' },
    { number: 2, title: 'Investigate', icon: 'ri-search-eye-line' },
    { number: 3, title: 'Take Action', icon: 'ri-hammer-line' },
    { number: 4, title: 'Resolve', icon: 'ri-check-double-line' },
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
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'rejected', label: 'Rejected' }
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
                { value: 'client', label: 'Client' },
                { value: 'freelancer', label: 'Freelancer' },
                { value: 'employer', label: 'Employer' },
                { value: 'applicant', label: 'Job Seeker' },
                { value: 'learner', label: 'Learner' }
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
                { value: 'payment', label: 'Payment Issue' },
                { value: 'delay', label: 'Project Delay' },
                { value: 'misuse', label: 'Misuse' },
                { value: 'harassment', label: 'Harassment' },
                { value: 'other', label: 'Other' }
              ]}
              placeholder="All Types"
            />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
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
                        {statusLabels[complaint.status]}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getTypeColor(complaint.type)}`}>
                        {typeLabels[complaint.type]}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm line-clamp-2">{complaint.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                      <img src={complaint.complainant.avatar} alt="" className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Complainant</p>
                      <p className="text-white">{complaint.complainant.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                      <img src={complaint.reportedUser.avatar} alt="" className="w-full h-full object-cover object-top" />
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
                  {complaint.status === 'resolved' || complaint.status === 'rejected' ? 'View Case' : 'Handle Case'}
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
      </div>

      {/* Resolution Flow Modal */}
      {showResolutionFlow && selectedComplaint && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1f37] rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-white/10 flex flex-col">
            {/* Header with Steps */}
            <div className="p-6 border-b border-white/10 bg-[#1a1f37] sticky top-0 z-10">
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
                      onClick={() => (selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected') && setCurrentStep(step.number)}
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

                  {/* Complaint Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-lg font-semibold text-white">{selectedComplaint.subject}</h5>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedComplaint.status)}`}>
                              {statusLabels[selectedComplaint.status]}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(selectedComplaint.type)}`}>
                              {typeLabels[selectedComplaint.type]}
                            </span>
                          </div>
                        </div>
                        <p className="text-white/70 leading-relaxed">{selectedComplaint.description}</p>
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-sm text-white/50">
                          <span><i className="ri-calendar-line mr-1"></i> {selectedComplaint.submittedDate}</span>
                          <span><i className="ri-attachment-line mr-1"></i> {selectedComplaint.evidence.length} attachments</span>
                        </div>
                      </div>

                      {/* Users */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/50 text-xs mb-3 uppercase tracking-wider">Complainant</p>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img src={selectedComplaint.complainant.avatar} alt="" className="w-full h-full object-cover object-top" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{selectedComplaint.complainant.name}</p>
                              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded text-xs font-semibold">
                                {selectedComplaint.complainant.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/50 text-xs mb-3 uppercase tracking-wider">Reported User</p>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <img src={selectedComplaint.reportedUser.avatar} alt="" className="w-full h-full object-cover object-top" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{selectedComplaint.reportedUser.name}</p>
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">
                                {selectedComplaint.reportedUser.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Related Project */}
                      {selectedComplaint.relatedProject && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/50 text-xs mb-3 uppercase tracking-wider">Related Project</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-teal-400 font-semibold">{selectedComplaint.relatedProject.name}</p>
                              <p className="text-white/50 text-sm">Budget: ${selectedComplaint.relatedProject.budget.toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedComplaint.relatedProject.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {selectedComplaint.relatedProject.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Evidence */}
                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <h5 className="text-lg font-semibold text-white mb-4">
                        <i className="ri-attachment-line mr-2 text-teal-400"></i>
                        Evidence & Attachments
                      </h5>
                      <div className="space-y-4">
                        {selectedComplaint.evidence.map((item, index) => (
                          <div key={index} className="bg-white/5 rounded-lg overflow-hidden">
                            {item.type === 'image' ? (
                              <div>
                                <div className="w-full h-48">
                                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                  <span className="text-white/60 text-sm truncate">{item.name}</span>
                                  <button className="text-teal-400 hover:text-teal-300 cursor-pointer">
                                    <i className="ri-external-link-line"></i>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
                                    <i className="ri-file-pdf-line text-xl text-red-400"></i>
                                  </div>
                                  <span className="text-white truncate">{item.name}</span>
                                </div>
                                <button className="text-teal-400 hover:text-teal-300 cursor-pointer">
                                  <i className="ri-download-line"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        {selectedComplaint.evidence.length === 0 && (
                          <p className="text-white/40 text-center py-8">No evidence attached</p>
                        )}
                      </div>
                    </div>
                  </div>
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
                      <p className="text-white/60 text-sm">Review user profiles, project timeline, payments, and communications</p>
                    </div>
                  </div>

                  {/* Investigation Tabs */}
                  <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
                    {[
                      { id: 'profiles', label: 'User Profiles', icon: 'ri-user-line' },
                      { id: 'timeline', label: 'Project Timeline', icon: 'ri-time-line' },
                      { id: 'payments', label: 'Payment History', icon: 'ri-money-dollar-circle-line' },
                      { id: 'chat', label: 'Chat Logs', icon: 'ri-chat-3-line' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setInvestigationTab(tab.id as typeof investigationTab)}
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

                  {/* User Profiles Tab */}
                  {investigationTab === 'profiles' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Complainant Profile */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                          <i className="ri-user-line text-teal-400"></i>
                          <h5 className="text-lg font-semibold text-white">Complainant Profile</h5>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-20 h-20 rounded-full overflow-hidden">
                            <img src={selectedComplaint.complainant.avatar} alt="" className="w-full h-full object-cover object-top" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-white">{selectedComplaint.complainant.name}</p>
                            <p className="text-white/60">{selectedComplaint.complainant.email}</p>
                            <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold mt-2 inline-block">
                              {selectedComplaint.complainant.role}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-white">{selectedComplaint.complainant.totalProjects}</p>
                            <p className="text-white/50 text-xs">Projects</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-white">{selectedComplaint.complainant.rating || 'N/A'}</p>
                            <p className="text-white/50 text-xs">Rating</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-sm font-bold text-white">{selectedComplaint.complainant.joinDate}</p>
                            <p className="text-white/50 text-xs">Joined</p>
                          </div>
                        </div>
                      </div>

                      {/* Reported User Profile */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                          <i className="ri-user-warning-line text-orange-400"></i>
                          <h5 className="text-lg font-semibold text-white">Reported User Profile</h5>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-20 h-20 rounded-full overflow-hidden">
                            <img src={selectedComplaint.reportedUser.avatar} alt="" className="w-full h-full object-cover object-top" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-white">{selectedComplaint.reportedUser.name}</p>
                            <p className="text-white/60">{selectedComplaint.reportedUser.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">
                                {selectedComplaint.reportedUser.role}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                selectedComplaint.reportedUser.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                selectedComplaint.reportedUser.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {selectedComplaint.reportedUser.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-white">{selectedComplaint.reportedUser.totalProjects}</p>
                            <p className="text-white/50 text-xs">Projects</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-white">{selectedComplaint.reportedUser.rating || 'N/A'}</p>
                            <p className="text-white/50 text-xs">Rating</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-orange-400">{selectedComplaint.reportedUser.warnings}</p>
                            <p className="text-white/50 text-xs">Warnings</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-sm font-bold text-white">{selectedComplaint.reportedUser.joinDate}</p>
                            <p className="text-white/50 text-xs">Joined</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project Timeline Tab */}
                  {investigationTab === 'timeline' && selectedComplaint.relatedProject && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h5 className="text-lg font-semibold text-white">{selectedComplaint.relatedProject.name}</h5>
                          <p className="text-white/50 text-sm">Budget: ${selectedComplaint.relatedProject.budget.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/50 text-sm">Start: {selectedComplaint.relatedProject.startDate}</p>
                          <p className="text-white/50 text-sm">Deadline: {selectedComplaint.relatedProject.deadline}</p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10"></div>
                        <div className="space-y-6">
                          {selectedComplaint.relatedProject.milestones.map((milestone, index) => (
                            <div key={index} className="relative flex items-start gap-4 pl-12">
                              <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                                milestone.status === 'Completed' ? 'bg-green-500 border-green-500' :
                                milestone.status === 'In Progress' ? 'bg-blue-500 border-blue-500' :
                                'bg-white/10 border-white/30'
                              }`}>
                                {milestone.status === 'Completed' && (
                                  <i className="ri-check-line text-white text-xs absolute top-0.5 left-0.5"></i>
                                )}
                              </div>
                              <div className="flex-1 bg-white/5 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="font-semibold text-white">{milestone.name}</h6>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    milestone.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                    milestone.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-white/10 text-white/50'
                                  }`}>
                                    {milestone.status}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-white/50">Due: {milestone.date}</span>
                                  <span className="text-teal-400 font-semibold">${milestone.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {investigationTab === 'timeline' && !selectedComplaint.relatedProject && (
                    <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
                      <i className="ri-calendar-line text-5xl text-white/20 mb-4 block"></i>
                      <p className="text-white/40">No project timeline available for this complaint</p>
                    </div>
                  )}

                  {/* Payment History Tab */}
                  {investigationTab === 'payments' && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h5 className="text-lg font-semibold text-white mb-4">Payment History</h5>
                      {selectedComplaint.paymentHistory && selectedComplaint.paymentHistory.length > 0 ? (
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
                              {selectedComplaint.paymentHistory.map((payment, index) => (
                                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                  <td className="py-3 px-4 text-white">{payment.date}</td>
                                  <td className="py-3 px-4 text-white/70">{payment.type}</td>
                                  <td className="py-3 px-4 text-right text-teal-400 font-semibold">${payment.amount.toLocaleString()}</td>
                                  <td className="py-3 px-4 text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                      payment.status === 'Released' ? 'bg-green-500/20 text-green-400' :
                                      payment.status === 'Held in Escrow' ? 'bg-yellow-500/20 text-yellow-400' :
                                      payment.status.includes('Approved') ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-white/10 text-white/50'
                                    }`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <i className="ri-money-dollar-circle-line text-5xl text-white/20 mb-4 block"></i>
                          <p className="text-white/40">No payment history available</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat Logs Tab */}
                  {investigationTab === 'chat' && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h5 className="text-lg font-semibold text-white mb-4">Communication Logs</h5>
                      {selectedComplaint.chatLogs && selectedComplaint.chatLogs.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {selectedComplaint.chatLogs.map((log, index) => {
                            const isComplainant = log.sender === selectedComplaint.complainant.name;
                            return (
                              <div key={index} className={`flex ${isComplainant ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[70%] ${isComplainant ? 'bg-white/10' : 'bg-teal-500/20'} rounded-lg p-3`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold ${isComplainant ? 'text-teal-400' : 'text-orange-400'}`}>
                                      {log.sender}
                                    </span>
                                    <span className="text-white/30 text-xs">{log.date}</span>
                                  </div>
                                  <p className="text-white text-sm">{log.message}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <i className="ri-chat-3-line text-5xl text-white/20 mb-4 block"></i>
                          <p className="text-white/40">No chat logs available</p>
                        </div>
                      )}
                    </div>
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

                  {selectedComplaint.status === 'resolved' || selectedComplaint.status === 'rejected' ? (
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

                  {selectedComplaint.status === 'resolved' || selectedComplaint.status === 'rejected' ? (
                    <div className="space-y-6">
                      {/* Resolution Summary */}
                      <div className={`rounded-xl p-6 border ${
                        selectedComplaint.status === 'resolved' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                            selectedComplaint.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            <i className={`${selectedComplaint.status === 'resolved' ? 'ri-check-line' : 'ri-close-line'} text-2xl text-white`}></i>
                          </div>
                          <div>
                            <h5 className="text-xl font-bold text-white">
                              Case {selectedComplaint.status === 'resolved' ? 'Resolved' : 'Rejected'}
                            </h5>
                            <p className="text-white/60 text-sm">This complaint has been closed</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Resolution Note</p>
                          <p className="text-white">{selectedComplaint.resolution}</p>
                        </div>
                      </div>

                      {/* Activity Timeline */}
                      {selectedComplaint.adminNotes.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h5 className="text-lg font-semibold text-white mb-4">
                            <i className="ri-history-line mr-2 text-teal-400"></i>
                            Activity Timeline
                          </h5>
                          <div className="relative">
                            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/10"></div>
                            <div className="space-y-4">
                              {selectedComplaint.adminNotes.map((note, index) => (
                                <div key={index} className="relative flex items-start gap-4 pl-8">
                                  <div className="absolute left-1 w-5 h-5 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                  </div>
                                  <div className="flex-1 bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-teal-400 font-semibold text-sm">{note.action}</span>
                                      <span className="text-white/40 text-xs">{note.date}</span>
                                    </div>
                                    <p className="text-white/70 text-sm">{note.note}</p>
                                    <p className="text-white/40 text-xs mt-2">By: {note.admin}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Actions Summary */}
                      {selectedActions.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Actions to be executed</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedActions.map((id) => {
                              const action = actionOptions.find((a) => a.id === id);
                              return action ? (
                                <span key={id} className={`px-3 py-1 rounded-full text-sm font-semibold bg-${action.color}-500/20 text-${action.color}-400`}>
                                  {action.label}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

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
            <div className="p-6 border-t border-white/10 bg-[#1a1f37] sticky bottom-0">
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
                  {currentStep === 4 && selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' && (
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
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Next Step
                      <i className="ri-arrow-right-line ml-2"></i>
                    </button>
                  )}

                  {currentStep === 4 && (selectedComplaint.status === 'resolved' || selectedComplaint.status === 'rejected') && (
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
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
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
      )}
    </div>
  );
};

export default ComplaintsManagement;
