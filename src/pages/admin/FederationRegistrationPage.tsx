import React, { useState, useEffect } from 'react';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { Badge } from '../../components/common/Badge';
import {
  FederationApplication,
  FederationAuthorizedDesignation,
  FederationDocumentItem,
  DeclaredSocietyItem,
} from '../../types';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Upload,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Send,
  HelpCircle,
} from 'lucide-react';

interface FederationRegistrationPageProps {
  existingApplicationId?: string;
  onNavigateBack?: () => void;
  onSubmitted?: (applicationId: string) => void;
}

const DEFAULT_SERVICES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Cleaner',
  'Appliance Repairs',
  'Gardener',
  'Driver',
  'Technician',
  'Security & Facility Management',
  'Pest Control',
];

const FEDERATION_TYPES = [
  'State Federation',
  'Multi-State Cooperative Federation',
  'Regional Apex Cooperative',
  'District Cooperative Union',
];

const DESIGNATIONS: FederationAuthorizedDesignation[] = [
  'Federation Manager',
  'President',
  'Secretary',
  'CEO / Chief Executive',
  'Chief Operating Officer',
  'Director',
  'Other',
];

export const FederationRegistrationPage: React.FC<FederationRegistrationPageProps> = ({
  existingApplicationId,
  onNavigateBack,
  onSubmitted,
}) => {
  const {
    currentUser,
    federationApplications,
    submitFederationApplication,
    resubmitFederationApplication,
    showToast,
  } = useCooperativeStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedApp, setSubmittedApp] = useState<FederationApplication | null>(null);

  // Form State
  const [federationName, setFederationName] = useState('');
  const [federationType, setFederationType] = useState('State Federation');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [fullAddress, setFullAddress] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialPhone, setOfficialPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Authorized Person State
  const [authorizedPersonName, setAuthorizedPersonName] = useState('');
  const [authorizedPersonDesignation, setAuthorizedPersonDesignation] =
    useState<FederationAuthorizedDesignation>('Federation Manager');
  const [authorizedPersonEmail, setAuthorizedPersonEmail] = useState('');
  const [authorizedPersonPhone, setAuthorizedPersonPhone] = useState('');
  const [authorizedPersonIdType, setAuthorizedPersonIdType] = useState('Aadhaar');
  const [authorizedPersonIdNumber, setAuthorizedPersonIdNumber] = useState('');

  // Services State
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Electrician',
    'Plumber',
    'Carpenter',
    'Cleaner',
  ]);

  // Declared Societies State
  const [declaredSocieties, setDeclaredSocieties] = useState<DeclaredSocietyItem[]>([
    {
      id: 'soc_temp_1',
      name: 'Sample Housing Cooperative Society',
      code: 'SHC',
      district: 'Pune',
      pincode: '411045',
      totalHouseholds: 300,
    },
  ]);
  const [newSocName, setNewSocName] = useState('');
  const [newSocCode, setNewSocCode] = useState('');
  const [newSocDistrict, setNewSocDistrict] = useState('');
  const [newSocPincode, setNewSocPincode] = useState('');
  const [newSocHouseholds, setNewSocHouseholds] = useState<number>(100);

  // Documents State
  const [documents, setDocuments] = useState<FederationDocumentItem[]>([
    {
      id: 'doc_init_1',
      documentType: 'registration_certificate',
      title: 'State / Multi-State Cooperative Registration Certificate',
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'PENDING',
    },
    {
      id: 'doc_init_2',
      documentType: 'authorization_letter',
      title: 'Apex Board Resolution & Manager Authorization Letter',
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'PENDING',
    },
    {
      id: 'doc_init_3',
      documentType: 'bye_laws',
      title: 'Certified Registered Cooperative Bye-Laws',
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'PENDING',
    },
    {
      id: 'doc_init_4',
      documentType: 'address_proof',
      title: 'Registered Apex Headquarters Office Address Proof',
      fileName: '',
      fileSize: '',
      uploadedAt: '',
      status: 'PENDING',
    },
  ]);

  const [existingApp, setExistingApp] = useState<FederationApplication | null>(null);

  // Load existing application if passed or found for user
  useEffect(() => {
    let targetApp: FederationApplication | undefined;
    if (existingApplicationId) {
      targetApp = federationApplications.find((a) => a.id === existingApplicationId);
    } else if (currentUser.role === 'federation_admin') {
      targetApp = federationApplications.find(
        (a) => a.federationId === currentUser.federationId || a.officialEmail === currentUser.email
      );
    }

    if (targetApp) {
      setExistingApp(targetApp);
      setFederationName(targetApp.federationName);
      setFederationType(targetApp.federationType);
      setRegistrationNumber(targetApp.registrationNumber);
      setRegistrationDate(targetApp.registrationDate || '');
      setState(targetApp.state);
      setDistrict(targetApp.district);
      setFullAddress(targetApp.fullAddress);
      setOfficialEmail(targetApp.officialEmail);
      setOfficialPhone(targetApp.officialPhone);
      setWebsite(targetApp.website || '');
      setAuthorizedPersonName(targetApp.authorizedPersonName);
      setAuthorizedPersonDesignation(targetApp.authorizedPersonDesignation);
      setAuthorizedPersonEmail(targetApp.authorizedPersonEmail);
      setAuthorizedPersonPhone(targetApp.authorizedPersonPhone);
      setAuthorizedPersonIdType(targetApp.authorizedPersonIdType);
      setAuthorizedPersonIdNumber(targetApp.authorizedPersonIdNumber || '');
      setSelectedServices(targetApp.selectedServices || DEFAULT_SERVICES.slice(0, 4));
      if (targetApp.declaredSocieties && targetApp.declaredSocieties.length > 0) {
        setDeclaredSocieties(targetApp.declaredSocieties);
      }
      if (targetApp.documents && targetApp.documents.length > 0) {
        setDocuments(targetApp.documents);
      }
    } else {
      // Auto pre-fill representative from current user if federation_admin
      if (currentUser.role === 'federation_admin') {
        setAuthorizedPersonName(currentUser.name);
        setAuthorizedPersonEmail(currentUser.email);
        setAuthorizedPersonPhone(currentUser.phone.replace(/[^0-9]/g, ''));
      }
    }
  }, [existingApplicationId, currentUser, federationApplications]);

  const handleToggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleAddSociety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocName.trim()) {
      showToast({ title: 'Society Name Required', message: 'Enter a valid society name.', type: 'warning' });
      return;
    }
    const newSoc: DeclaredSocietyItem = {
      id: `soc_decl_${Date.now()}`,
      name: newSocName.trim(),
      code: newSocCode.trim().toUpperCase() || newSocName.substring(0, 3).toUpperCase(),
      district: newSocDistrict.trim() || district,
      pincode: newSocPincode.trim() || '411001',
      totalHouseholds: newSocHouseholds || 100,
    };
    setDeclaredSocieties((prev) => [...prev, newSoc]);
    setNewSocName('');
    setNewSocCode('');
    setNewSocDistrict('');
    setNewSocPincode('');
    setNewSocHouseholds(100);
    showToast({ title: 'Society Added', message: `Added ${newSoc.name} to declaration.`, type: 'info' });
  };

  const handleRemoveSociety = (id: string) => {
    setDeclaredSocieties((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSimulateFileUpload = (docIndex: number, fileType: string) => {
    const defaultFileNames: Record<string, string> = {
      registration_certificate: `${federationName.replace(/\s+/g, '_') || 'Federation'}_RegCert.pdf`,
      authorization_letter: `Board_Resolution_${authorizedPersonName.replace(/\s+/g, '_') || 'Manager'}.pdf`,
      bye_laws: `${federationName.replace(/\s+/g, '_') || 'Federation'}_ByeLaws_Certified.pdf`,
      address_proof: `ApexOffice_Address_Proof_${district}.pdf`,
    };

    const fileName = defaultFileNames[fileType] || `Statutory_Document_${docIndex + 1}.pdf`;
    const fileSize = `${(1.2 + Math.random() * 2.5).toFixed(1)} MB`;
    const now = new Date().toISOString().split('T')[0];

    setDocuments((prev) =>
      prev.map((doc, idx) =>
        idx === docIndex
          ? {
              ...doc,
              fileName,
              fileSize,
              uploadedAt: now,
              status: 'UPLOADED',
            }
          : doc
      )
    );

    showToast({
      title: 'Document Uploaded',
      message: `${fileName} attached successfully.`,
      type: 'success',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!federationName.trim() || !registrationNumber.trim()) {
      showToast({ title: 'Validation Error', message: 'Federation Name & Registration Number are required.', type: 'warning' });
      setCurrentStep(1);
      return;
    }

    if (!authorizedPersonName.trim() || !authorizedPersonEmail.trim() || !authorizedPersonPhone.trim()) {
      showToast({ title: 'Validation Error', message: 'Authorized Person contact details are required.', type: 'warning' });
      setCurrentStep(2);
      return;
    }

    // Check at least registration cert & board resolution uploaded
    const regDoc = documents.find((d) => d.documentType === 'registration_certificate');
    const authDoc = documents.find((d) => d.documentType === 'authorization_letter');
    if (!regDoc?.fileName || !authDoc?.fileName) {
      showToast({
        title: 'Documents Required',
        message: 'Please upload at least the Registration Certificate and Board Resolution.',
        type: 'warning',
      });
      setCurrentStep(3);
      return;
    }

    if (declaredSocieties.length === 0) {
      showToast({
        title: 'Societies Required',
        message: 'Please declare at least one member cooperative society.',
        type: 'warning',
      });
      setCurrentStep(4);
      return;
    }

    const payload = {
      federationId: existingApp?.federationId,
      federationName: federationName.trim(),
      federationType,
      registrationNumber: registrationNumber.trim(),
      registrationDate,
      state,
      district,
      fullAddress: fullAddress.trim(),
      officialEmail: officialEmail.trim() || authorizedPersonEmail.trim(),
      officialPhone: officialPhone.trim() || authorizedPersonPhone.trim(),
      website: website.trim(),
      authorizedPersonName: authorizedPersonName.trim(),
      authorizedPersonDesignation,
      authorizedPersonEmail: authorizedPersonEmail.trim(),
      authorizedPersonPhone: authorizedPersonPhone.trim(),
      authorizedPersonIdType,
      authorizedPersonIdNumber: authorizedPersonIdNumber.trim(),
      documents,
      societiesCount: declaredSocieties.length,
      declaredSocieties,
      selectedServices,
      applicantUserId: currentUser.id,
    };

    if (existingApp && existingApp.status === 'CHANGES_REQUIRED') {
      resubmitFederationApplication(existingApp.id, payload);
      const updated = {
        ...existingApp,
        ...payload,
        status: 'PENDING_VERIFICATION' as const,
        operatingStatus: 'PENDING' as const,
        updatedAt: new Date().toISOString(),
      };
      setSubmittedApp(updated);
    } else if (existingApp) {
      // Update existing
      resubmitFederationApplication(existingApp.id, payload);
      setSubmittedApp({ ...existingApp, ...payload });
    } else {
      // New application
      const created = submitFederationApplication(payload);
      setSubmittedApp(created);
    }

    if (onSubmitted) {
      onSubmitted(existingApp ? existingApp.id : 'NEW');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141413] pb-16">
      {/* Top Banner */}
      <div className="bg-[#141413] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#2A2926]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Statutory Accreditation
              </span>
              {existingApp && (
                <Badge variant={existingApp.status === 'CHANGES_REQUIRED' ? 'warning' : 'neutral'} size="sm">
                  {existingApp.status}
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF9F5] mt-1">
              {existingApp ? 'Apex Federation Registration & Compliance' : 'Register New Apex Cooperative Federation'}
            </h1>
            <p className="text-xs text-[#A8A29E] mt-0.5">
              Submit state/multi-state federation credentials for Platform Central Authority audit and verification.
            </p>
          </div>

          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="px-3.5 py-2 rounded-xl bg-[#21201D] border border-[#33322E] text-xs font-semibold text-[#FAF9F5] hover:bg-[#2C2B27] flex items-center gap-1.5 self-start cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* If already submitted confirmation screen */}
        {submittedApp && (
          <div className="p-6 rounded-2xl border border-green-300 bg-green-50 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-green-950">
                Federation Application Successfully Submitted!
              </h2>
              <p className="text-xs text-green-900 mt-1 max-w-lg mx-auto">
                Application reference <strong>#{submittedApp.id}</strong> has been transmitted to the <strong>Platform Central Authority (Rajeshwar Sen Gupta, Chief Registrar)</strong> for verification.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-green-200 text-left text-xs max-w-md mx-auto space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#77736B]">Federation:</span>
                <span className="font-bold text-[#141413]">{submittedApp.federationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736B]">Registration No:</span>
                <span className="font-mono text-[#141413]">{submittedApp.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736B]">Representative:</span>
                <span className="font-semibold text-[#141413]">{submittedApp.authorizedPersonName} ({submittedApp.authorizedPersonDesignation})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736B]">Current Status:</span>
                <Badge variant="warning" size="sm">PENDING VERIFICATION</Badge>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 max-w-md mx-auto text-left flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verification in progress:</strong> Federation Workspace access is locked until approved by the Platform Central Authority.
              </span>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              {onNavigateBack ? (
                <button
                  onClick={onNavigateBack}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow cursor-pointer"
                >
                  Return to Sign In
                </button>
              ) : (
                <button
                  onClick={() => setSubmittedApp(null)}
                  className="px-4 py-2 rounded-xl border border-green-400 text-green-950 font-semibold text-xs hover:bg-green-100 cursor-pointer"
                >
                  View / Edit Submission
                </button>
              )}
            </div>
          </div>
        )}

        {/* Change Request Notification Banner */}
        {!submittedApp && existingApp && existingApp.status === 'CHANGES_REQUIRED' && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <span className="font-bold">Platform Admin Action Required:</span>
              <p className="mt-0.5 font-medium text-amber-900">
                {existingApp.changeRequestReason || 'Please review the requested changes and re-upload required statutory documents below.'}
              </p>
              {existingApp.reviewedAt && (
                <span className="text-[11px] text-amber-700 mt-1 block">
                  Reviewed on {existingApp.reviewedAt} by {existingApp.reviewedBy || 'Central Authority'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Multi-step Navigation */}
        {!submittedApp && (
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
            {[
              { num: 1, title: 'Basic Details' },
              { num: 2, title: 'Representative' },
              { num: 3, title: 'Documents' },
              { num: 4, title: 'Societies' },
              { num: 5, title: 'Review & Submit' },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`p-2.5 rounded-xl border transition-all ${
                  currentStep === step.num
                    ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                    : currentStep > step.num
                    ? 'bg-white text-green-700 border-green-300'
                    : 'bg-white text-[#77736B] border-[#D5D0C7] hover:bg-[#FAF9F5]'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider">Step {step.num}</div>
                <div className="truncate">{step.title}</div>
              </button>
            ))}
          </div>
        )}

        {/* Form Container */}
        {!submittedApp && (
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-[#D5D0C7] bg-white space-y-6 shadow-sm">
            {/* STEP 1: Basic Federation Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-[#E8E6DF] pb-3">
                  <h3 className="text-base font-serif font-bold text-[#141413] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" /> Section A: Federation Registration Details
                  </h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Official apex cooperative federation credentials registered under the Cooperative Societies Act.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="font-bold text-[#141413] block mb-1">Federation Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra Community Federation"
                      value={federationName}
                      onChange={(e) => setFederationName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Federation Type *</label>
                    <select
                      value={federationType}
                      onChange={(e) => setFederationType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {FEDERATION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Registration / Act Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MSCS/CR/2024/9912"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Date of Registration</label>
                    <input
                      type="date"
                      value={registrationDate}
                      onChange={(e) => setRegistrationDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">District / Jurisdiction *</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Official Federation Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="contact@statefederation.org"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Official Federation Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9822377410"
                      value={officialPhone}
                      onChange={(e) => setOfficialPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-[#141413] block mb-1">Website / Portal URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://maharashtracoop.org"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-[#141413] block mb-1">Registered Apex Headquarters Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Federation Apex House, Senapati Bapat Road, Pune 411016"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow flex items-center gap-1.5"
                  >
                    Next: Representative <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Authorized Person Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-[#E8E6DF] pb-3">
                  <h3 className="text-base font-serif font-bold text-[#141413] flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" /> Section B: Authorized Representative (Federation Manager / Lead)
                  </h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Designated official authorized by the Board of Directors to administer this Federation on the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Representative Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meera Nambiar"
                      value={authorizedPersonName}
                      onChange={(e) => setAuthorizedPersonName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Board Designation / Role *</label>
                    <select
                      value={authorizedPersonDesignation}
                      onChange={(e) => setAuthorizedPersonDesignation(e.target.value as FederationAuthorizedDesignation)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Direct Official Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="meera.nambiar@coop.org"
                      value={authorizedPersonEmail}
                      onChange={(e) => setAuthorizedPersonEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Direct Mobile Phone (10 digits) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9822377410"
                      value={authorizedPersonPhone}
                      onChange={(e) => setAuthorizedPersonPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">Identity Proof Type</label>
                    <select
                      value={authorizedPersonIdType}
                      onChange={(e) => setAuthorizedPersonIdType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#141413] block mb-1">ID Document Number (Masked / Reference)</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-9182"
                      value={authorizedPersonIdNumber}
                      onChange={(e) => setAuthorizedPersonIdNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl border border-[#D5D0C7] text-xs font-semibold text-[#141413] hover:bg-[#FAF9F5]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow flex items-center gap-1.5"
                  >
                    Next: Statutory Documents <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Statutory Federation Documents */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-[#E8E6DF] pb-3">
                  <h3 className="text-base font-serif font-bold text-[#141413] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" /> Section C: Statutory Federation Compliance Documents
                  </h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Upload official registered documents for Platform Central Authority audit (PDF/JPG, max 10 MB each).
                  </p>
                </div>

                <div className="space-y-3">
                  {documents.map((doc, idx) => {
                    const isUploaded = !!doc.fileName;
                    const isCorrection = doc.status === 'NEEDS_CORRECTION';
                    return (
                      <div
                        key={doc.id || idx}
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isCorrection
                            ? 'border-amber-300 bg-amber-50/70'
                            : isUploaded
                            ? 'border-green-300 bg-green-50/50'
                            : 'border-[#D5D0C7] bg-[#FAF9F5]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isUploaded ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#141413]">{doc.title}</span>
                              {isCorrection && <Badge variant="warning" size="sm">ACTION REQUIRED: RE-UPLOAD</Badge>}
                              {isUploaded && !isCorrection && <Badge variant="success" size="sm">ATTACHED</Badge>}
                            </div>
                            <p className="text-[11px] text-[#77736B] mt-0.5">
                              {isUploaded ? (
                                <span className="font-mono text-[#141413]">
                                  {doc.fileName} ({doc.fileSize}) · Uploaded {doc.uploadedAt}
                                </span>
                              ) : (
                                <span>No file attached yet · Required for verification</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleSimulateFileUpload(idx, doc.documentType)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isUploaded
                                ? 'bg-white border border-[#D5D0C7] text-[#141413] hover:bg-[#FAF9F5]'
                                : 'bg-purple-700 text-white hover:bg-purple-800 shadow-sm'
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploaded ? 'Replace File' : 'Upload Document'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-xl border border-[#D5D0C7] text-xs font-semibold text-[#141413] hover:bg-[#FAF9F5]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow flex items-center gap-1.5"
                  >
                    Next: Declared Societies <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Declared Member Societies & Services */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-[#E8E6DF] pb-3">
                  <h3 className="text-base font-serif font-bold text-[#141413] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" /> Section D: Federation Structure & Service Domains
                  </h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Declare member societies and trade categories covered by this apex federation.
                  </p>
                </div>

                {/* Service Domains */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#141413] block">Declared Service Domains</label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_SERVICES.map((srv) => {
                      const isSelected = selectedServices.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => handleToggleService(srv)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-purple-700 text-white shadow-sm'
                              : 'bg-[#FAF9F5] text-[#77736B] border border-[#D5D0C7] hover:border-purple-300'
                          }`}
                        >
                          {srv} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Declared Societies List */}
                <div className="space-y-3 pt-2 border-t border-[#E8E6DF]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#141413]">
                      Declared Member Cooperative Societies ({declaredSocieties.length})
                    </label>
                    <span className="text-[11px] text-[#77736B]">Minimum 1 required</span>
                  </div>

                  <div className="border border-[#D5D0C7] rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#FAF9F5] border-b border-[#D5D0C7] text-[#77736B] font-semibold">
                        <tr>
                          <th className="p-2.5">Society Name</th>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">District</th>
                          <th className="p-2.5">Pincode</th>
                          <th className="p-2.5">Households</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E6DF]">
                        {declaredSocieties.map((soc) => (
                          <tr key={soc.id} className="hover:bg-[#FAF9F5]">
                            <td className="p-2.5 font-semibold text-[#141413]">{soc.name}</td>
                            <td className="p-2.5 font-mono text-[#77736B]">{soc.code}</td>
                            <td className="p-2.5 text-[#141413]">{soc.district}</td>
                            <td className="p-2.5 text-[#77736B] font-mono">{soc.pincode}</td>
                            <td className="p-2.5 text-[#141413]">{soc.totalHouseholds} units</td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveSociety(soc.id)}
                                className="p-1 rounded text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add society quick row */}
                  <div className="p-3 rounded-xl border border-dashed border-[#D5D0C7] bg-[#FAF9F5] grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Society / Enclave Name"
                        value={newSocName}
                        onChange={(e) => setNewSocName(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[#D5D0C7] bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Code (e.g. BLR)"
                        value={newSocCode}
                        onChange={(e) => setNewSocCode(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[#D5D0C7] bg-white uppercase font-mono"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="District"
                        value={newSocDistrict}
                        onChange={(e) => setNewSocDistrict(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[#D5D0C7] bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newSocPincode}
                        onChange={(e) => setNewSocPincode(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[#D5D0C7] bg-white font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleAddSociety}
                        className="w-full py-1.5 rounded-lg bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 rounded-xl border border-[#D5D0C7] text-xs font-semibold text-[#141413] hover:bg-[#FAF9F5]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow flex items-center gap-1.5"
                  >
                    Next: Review & Submit <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Final Review & Submission */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="border-b border-[#E8E6DF] pb-3">
                  <h3 className="text-base font-serif font-bold text-[#141413] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600" /> Section E: Final Review & Submission
                  </h3>
                  <p className="text-xs text-[#77736B] mt-0.5">
                    Verify all application data before submitting to the Platform Central Authority.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-2">
                    <div className="font-bold text-[#141413] flex items-center gap-1.5 border-b border-[#E8E6DF] pb-1.5">
                      <Building2 className="w-4 h-4 text-purple-600" /> Federation Information
                    </div>
                    <div><strong>Name:</strong> {federationName || '—'}</div>
                    <div><strong>Type:</strong> {federationType}</div>
                    <div><strong>Reg No:</strong> <span className="font-mono font-bold">{registrationNumber || '—'}</span></div>
                    <div><strong>Jurisdiction:</strong> {district}, {state}</div>
                    <div><strong>Official Email:</strong> {officialEmail || '—'}</div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-2">
                    <div className="font-bold text-[#141413] flex items-center gap-1.5 border-b border-[#E8E6DF] pb-1.5">
                      <User className="w-4 h-4 text-purple-600" /> Authorized Representative
                    </div>
                    <div><strong>Name:</strong> {authorizedPersonName || '—'}</div>
                    <div><strong>Designation:</strong> {authorizedPersonDesignation}</div>
                    <div><strong>Direct Phone:</strong> {authorizedPersonPhone || '—'}</div>
                    <div><strong>Direct Email:</strong> {authorizedPersonEmail || '—'}</div>
                    <div><strong>ID Reference:</strong> {authorizedPersonIdType} ({authorizedPersonIdNumber || 'Attached'})</div>
                  </div>
                </div>

                {/* Declared Scope Summary */}
                <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-2 text-xs">
                  <div className="font-bold text-[#141413] border-b border-[#E8E6DF] pb-1.5">
                    Cooperative Scope: {declaredSocieties.length} Member Societies · {selectedServices.length} Service Domains
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {declaredSocieties.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white border border-[#D5D0C7] text-[#141413] text-[11px]">
                        {s.name} ({s.code})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Documents Checklist */}
                <div className="p-4 rounded-xl border border-[#D5D0C7] bg-[#FAF9F5] space-y-2 text-xs">
                  <div className="font-bold text-[#141413] border-b border-[#E8E6DF] pb-1.5">
                    Statutory Documents Attached ({documents.filter((d) => d.fileName).length}/{documents.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        {doc.fileName ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span className="truncate">{doc.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Declaration Statement */}
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-2.5">
                  <input type="checkbox" required id="decl_chk" className="mt-0.5" defaultChecked />
                  <label htmlFor="decl_chk" className="cursor-pointer">
                    I declare on behalf of <strong>{federationName || 'this Federation'}</strong> that all registered information and uploaded statutory documents are true, certified, and compliant with applicable state and multi-state cooperative laws.
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2 rounded-xl border border-[#D5D0C7] text-xs font-semibold text-[#141413] hover:bg-[#FAF9F5]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{existingApp?.status === 'CHANGES_REQUIRED' ? 'Resubmit for Verification' : 'Submit Application'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
