import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Star,
  Video,
  X,
} from 'lucide-react';
import { DoctorProfile } from '../../types/medicure';
import { ClinicalAvatar } from '../ClinicalVisuals';

interface FindDoctorsViewProps {
  doctors: DoctorProfile[];
  initialSpecialty?: string;
  onSelectDoctor: (doctorId: string) => void;
  onBookDoctor: (doctorId: string, preset?: { visitMode?: 'in-person' | 'telehealth'; time?: string }) => void;
  onOpenAiTriage: () => void;
}

export const FindDoctorsView: React.FC<FindDoctorsViewProps> = ({
  doctors,
  initialSpecialty = 'All',
  onSelectDoctor,
  onBookDoctor,
  onOpenAiTriage,
}) => {
  const [queryText, setQueryText] = useState(initialSpecialty !== 'All' ? initialSpecialty : '');
  const [visitMode, setVisitMode] = useState<'all' | 'in-person' | 'telehealth'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState(initialSpecialty);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'rating' | 'fee-low' | 'experience'>('rating');

  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((doc) => {
        const q = queryText.trim().toLowerCase();
        const matchesQuery =
          !q ||
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.hospital.toLowerCase().includes(q);
        const matchesMode =
          visitMode === 'all' ||
          (visitMode === 'telehealth' && doc.telehealthReady) ||
          (visitMode === 'in-person' && doc.inClinicReady);
        const matchesSpecialty =
          specialtyFilter === 'All' || doc.specialty.toLowerCase() === specialtyFilter.toLowerCase();
        const matchesAvail =
          availabilityFilter === 'all' || (availabilityFilter === 'today' && doc.availableToday);
        const matchesFee =
          feeFilter === 'all' ||
          (feeFilter === 'under-120' && doc.baseFee <= 120) ||
          (feeFilter === '100-150' && doc.baseFee >= 100 && doc.baseFee <= 150);
        return matchesQuery && matchesMode && matchesSpecialty && matchesAvail && matchesFee;
      })
      .sort((a, b) => {
        if (sortOrder === 'fee-low') return a.baseFee - b.baseFee;
        if (sortOrder === 'experience') return b.experienceYears - a.experienceYears;
        return b.rating - a.rating;
      });
  }, [doctors, queryText, visitMode, specialtyFilter, availabilityFilter, feeFilter, sortOrder]);

  const clearAll = () => {
    setQueryText('');
    setVisitMode('all');
    setSpecialtyFilter('All');
    setAvailabilityFilter('all');
    setFeeFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs text-[#64748B] font-medium mb-1">
            Patient Portal &gt; <span className="text-[#0B1C30] font-semibold">Find Doctors</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0B1C30]">
            Find Doctors &amp; Medical Specialists
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Search board-certified physicians, explore clinical departments, and schedule in-person or telehealth consultations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] text-[11px] font-semibold text-[#006B5F]">
            Accredited Medical Directory • Real-time Triage Sync
          </span>
          <button
            onClick={() => setSpecialtyFilter('All')}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0B1C30] hover:bg-[#F8FAFC] cursor-pointer"
          >
            View In-Network Coverage
          </button>
        </div>
      </div>

      {/* 4 Summary Tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[11px] font-bold text-[#64748B] uppercase">TOTAL AVAILABLE</div>
          <div className="font-display text-2xl font-bold text-[#0B1C30] mt-1 tabular-nums">142</div>
          <div className="text-xs font-semibold text-[#006B5F] mt-1">Specialists on Roster</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[11px] font-bold text-[#64748B] uppercase">IMMEDIATE CARE</div>
          <div className="font-display text-2xl font-bold text-[#0B1C30] mt-1 tabular-nums">28</div>
          <div className="text-xs font-semibold text-[#006B5F] mt-1">Available Today</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[11px] font-bold text-[#64748B] uppercase">CLINICAL UNITS</div>
          <div className="font-display text-2xl font-bold text-[#0B1C30] mt-1 tabular-nums">14</div>
          <div className="text-xs text-[#64748B] mt-1">Hospital Departments</div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow">
          <div className="text-[11px] font-bold text-[#64748B] uppercase">SATISFACTION</div>
          <div className="font-display text-2xl font-bold text-[#0B1C30] mt-1 tabular-nums flex items-center gap-1">
            4.9 <Star className="w-4 h-4 fill-[#006B5F] text-[#006B5F]" />
          </div>
          <div className="text-xs text-[#64748B] mt-1">From 18,400+ Reviews</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 clinical-shadow space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search by doctor name, specialty (e.g. Cardiology), or clinic..."
              className="w-full h-10 pl-9 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0B1C30] focus:outline-none focus:border-[#14B8A6] focus:bg-white"
            />
            {queryText && (
              <button
                onClick={() => setQueryText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B1C30] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg shrink-0">
            {(
              [
                { id: 'all', label: 'All Visits' },
                { id: 'in-person', label: 'In-Person Clinic' },
                { id: 'telehealth', label: 'Telehealth' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVisitMode(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  visitMode === tab.id
                    ? 'bg-white text-[#002541] shadow-xs'
                    : 'text-[#64748B] hover:text-[#002541]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0B1C30]"
          >
            <option value="All">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Gastroenterology">Gastroenterology</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0B1C30]"
          >
            <option value="all">Any Availability</option>
            <option value="today">Available Today</option>
          </select>

          <select
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value)}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0B1C30]"
          >
            <option value="all">All Consultation Fees</option>
            <option value="under-120">Up to $120</option>
            <option value="100-150">$100 – $150</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'rating' | 'fee-low' | 'experience')}
            className="h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0B1C30]"
          >
            <option value="rating">Highest Rated (5.0 - 4.0)</option>
            <option value="fee-low">Lowest Fee First</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#64748B]">Active Filters:</span>
            {specialtyFilter !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFF4FF] text-[#002541] font-semibold">
                Specialty: {specialtyFilter}
              </span>
            )}
            {availabilityFilter === 'today' && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#006B5F] font-semibold">
                Available: Today
              </span>
            )}
            <button
              onClick={clearAll}
              className="text-[#DC2626] font-semibold hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
          <span className="text-[#64748B] font-medium">
            Showing <strong className="text-[#0B1C30]">{filteredDoctors.length}</strong> Verified Specialists
          </span>
        </div>
      </div>

      {/* Results + Right Rail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center clinical-shadow">
              <p className="text-sm font-semibold text-[#0B1C30]">
                No specialists match your current filters.
              </p>
              <button
                onClick={clearAll}
                className="mt-3 px-4 py-2 bg-[#002541] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow hover:border-[#A6CAF3] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <ClinicalAvatar avatarKey={doc.avatarKey} name={doc.name} size="lg" activeDot />
                      <span className="mt-1.5 text-[10px] font-semibold text-[#006B5F] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                      <span className="text-[10px] font-mono-tabular text-[#64748B]">
                        NPI: {doc.npi}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onSelectDoctor(doc.id)}
                          className="font-display text-lg font-bold text-[#0B1C30] hover:text-[#006B5F] cursor-pointer text-left"
                        >
                          {doc.name}, {doc.credentials}
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            doc.availableToday
                              ? 'bg-[#ECFDF5] text-[#006B5F]'
                              : 'bg-[#EFF4FF] text-[#002541]'
                          }`}
                        >
                          {doc.availableToday ? 'Available Today' : 'Next Available Slot'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#006B5F] mt-0.5">
                        {doc.specialty} Specialist • {doc.department}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#42474E]">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          {doc.rating} <span className="text-[#64748B] font-normal">({doc.reviewCount} reviews)</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                          {doc.experienceYears} Yrs Experience
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-[#64748B]" />
                          {doc.languages.join(', ')}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#006B5F] font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {doc.telehealthReady ? 'Telehealth Ready' : 'In-Person Only'}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#64748B] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{doc.hospital}</span>
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-[#64748B] mr-1">Accepted Insurance:</span>
                        {doc.acceptedInsurance.map((ins) => (
                          <span
                            key={ins}
                            className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[11px] font-medium text-[#0B1C30]"
                          >
                            {ins}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase">
                      CONSULTATION FEE
                    </div>
                    <div className="font-display text-xl font-bold text-[#0B1C30] font-mono-tabular">
                      ${doc.baseFee}
                    </div>
                    <div className="text-[11px] font-semibold text-[#006B5F]">
                      ${doc.copayFee} w/ In-Network Copay
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase">
                      NEXT SLOTS:
                    </span>
                    {doc.nextSlots.slice(0, 2).map((slot) => (
                      <button
                        key={slot}
                        onClick={() => onBookDoctor(doc.id, { time: slot })}
                        className="px-2.5 py-1 rounded-md bg-[#F0FDFA] border border-[#CCFBF1] hover:bg-[#CCFBF1] text-[11px] font-semibold text-[#006B5F] font-mono-tabular cursor-pointer"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDoctor(doc.id)}
                      className="h-9 px-3.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0B1C30] rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onBookDoctor(doc.id)}
                      className="h-9 px-4 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Utility Column */}
        <div className="xl:col-span-4 space-y-5">
          {/* Urgent Care & Triage */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow">
            <div className="flex items-center gap-2 text-[#DC2626] font-bold text-sm">
              <span className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </span>
              <div>
                <div>Urgent Care &amp; Triage</div>
                <div className="text-[11px] font-medium text-[#DC2626]">
                  24/7 Clinical Emergency Line
                </div>
              </div>
            </div>
            <p className="text-xs text-[#42474E] mt-3 leading-relaxed">
              Experiencing acute symptoms? Connect instantly with an on-call triage practitioner without an advance booking.
            </p>
            <div className="mt-3 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="text-[#64748B] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Estimated Triage Wait:
              </span>
              <span className="font-bold text-[#006B5F] font-mono-tabular">~4 mins</span>
            </div>
            <button
              onClick={onOpenAiTriage}
              className="mt-3 w-full h-10 bg-[#002541] hover:bg-[#123B5D] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Connect with On-Call Triage Now
            </button>
          </div>

          {/* Insurance Policy Checker */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#002541]" />
              <div>
                <h3 className="text-sm font-bold text-[#0B1C30]">Insurance Policy Checker</h3>
                <p className="text-[11px] text-[#64748B]">Verify copay &amp; in-network status</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0B1C30]">Aetna Choice POS II</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#006B5F] text-[10px] font-bold">
                  Active
                </span>
              </div>
              <div className="text-[11px] font-mono-tabular text-[#64748B]">
                Member ID: #AET-9948201-01
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Standard Specialist Copay:</span>
                  <span className="font-bold font-mono-tabular">$30.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Remaining Deductible:</span>
                  <span className="font-bold font-mono-tabular">$240.00 / $1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Telehealth Copay:</span>
                  <span className="font-bold text-[#006B5F]">$0.00 (100% Covered)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Clinical Specialties */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 clinical-shadow">
            <h3 className="text-sm font-bold text-[#0B1C30] mb-1">Popular Clinical Specialties</h3>
            <p className="text-[11px] text-[#64748B] mb-3">
              Quick filter by highest demand clinical units
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Cardiology', count: 18 },
                { name: 'Pediatrics', count: 24 },
                { name: 'Orthopedics', count: 16 },
                { name: 'Dermatology', count: 14 },
                { name: 'Neurology', count: 11 },
              ].map((chip) => (
                <button
                  key={chip.name}
                  onClick={() => setSpecialtyFilter(chip.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    specialtyFilter === chip.name
                      ? 'bg-[#002541] text-white'
                      : 'bg-[#F1F5F9] text-[#0B1C30] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {chip.name} <span className="opacity-75">{chip.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Care Anywhere */}
          <div className="bg-[#EFF4FF] border border-[#DCE9FF] rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#002541] mb-1">
              <Video className="w-4 h-4 text-[#0284C7]" />
              <span>Virtual Care Anywhere</span>
            </div>
            <h4 className="font-display text-sm font-bold text-[#0B1C30]">
              15-Minute Video Consultations
            </h4>
            <p className="text-xs text-[#42474E] mt-1 leading-relaxed">
              Skip traffic and waiting rooms. Connect directly from your mobile device or desktop browser with encrypted HD video.
            </p>
            <button
              onClick={() => setVisitMode('telehealth')}
              className="mt-3 h-9 px-4 bg-[#006B5F] hover:bg-[#005048] text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Filter Telehealth Doctors &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
