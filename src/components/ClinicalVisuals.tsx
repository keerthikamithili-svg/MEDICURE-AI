import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const AVATAR_STYLES: Record<
  string,
  { initials: string; bg: string; coat: string; accent: string }
> = {
  'sarah-jenkins': {
    initials: 'SJ',
    bg: 'from-[#DCE9FF] to-[#E6F7F5]',
    coat: '#002541',
    accent: '#006B5F',
  },
  'marcus-vance': {
    initials: 'MV',
    bg: 'from-[#E5EEFF] to-[#D0E4FF]',
    coat: '#123B5D',
    accent: '#0284C7',
  },
  'elena-rostova': {
    initials: 'ER',
    bg: 'from-[#E6F7F5] to-[#D1FAE5]',
    coat: '#006B5F',
    accent: '#14B8A6',
  },
  'david-chen': {
    initials: 'DC',
    bg: 'from-[#EFF4FF] to-[#DCE9FF]',
    coat: '#00263D',
    accent: '#3D6185',
  },
  'amara-patel': {
    initials: 'AP',
    bg: 'from-[#F0F9FF] to-[#E0F2FE]',
    coat: '#003C5E',
    accent: '#006B5F',
  },
  'robert-sterling': {
    initials: 'RS',
    bg: 'from-[#E2E8F0] to-[#F1F5F9]',
    coat: '#213145',
    accent: '#006B5F',
  },
  patient: {
    initials: 'AW',
    bg: 'from-[#123B5D] to-[#006B5F]',
    coat: '#FFFFFF',
    accent: '#6DF5E1',
  },
  ceo: {
    initials: 'AV',
    bg: 'from-[#003C5E] to-[#123B5D]',
    coat: '#FFFFFF',
    accent: '#49A9EF',
  },
};

export const ClinicalAvatar: React.FC<{
  avatarKey?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  activeDot?: boolean;
}> = ({ avatarKey = 'sarah-jenkins', name, size = 'md', activeDot = false }) => {
  const style = AVATAR_STYLES[avatarKey] || AVATAR_STYLES['sarah-jenkins'];
  const initials = name
    ? name
        .replace(/^Dr\.\s+/i, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : style.initials;

  const sizeMap = {
    xs: 'w-7 h-7 text-[11px] rounded-full',
    sm: 'w-9 h-9 text-xs rounded-full',
    md: 'w-12 h-12 text-sm rounded-xl',
    lg: 'w-16 h-16 text-base rounded-xl',
    xl: 'w-24 h-24 text-2xl rounded-2xl',
  };

  const isDarkBg = avatarKey === 'patient' || avatarKey === 'ceo';

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizeMap[size]} bg-gradient-to-br ${style.bg} border border-[#E2E8F0] flex items-center justify-center font-display font-bold select-none shadow-xs overflow-hidden`}
        style={{ color: isDarkBg ? '#FFFFFF' : style.coat }}
        aria-label={name || 'Clinical profile avatar'}
      >
        <span>{initials}</span>
      </div>
      {activeDot && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-white"
          title="Verified Active"
        />
      )}
    </div>
  );
};

export const BostonCampusMap: React.FC<{
  label?: string;
  heightClass?: string;
}> = ({ label = 'St. Jude Heart Center • East Pavilion', heightClass = 'h-28' }) => {
  return (
    <div className={`relative w-full ${heightClass} rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#E8F1F8]`}>
      <svg
        viewBox="0 0 360 140"
        className="w-full h-full object-cover"
        aria-label="Boston Medical Campus Map"
      >
        <rect width="360" height="140" fill="#EDF3F8" />
        {/* Charles River & Harbor */}
        <path
          d="M0 34 C 70 18, 150 48, 230 22 C 280 8, 325 25, 360 15 L 360 0 L 0 0 Z"
          fill="#CFE4F7"
        />
        <path
          d="M270 140 C 295 100, 325 88, 360 72 L 360 140 Z"
          fill="#CFE4F7"
        />
        {/* Parks */}
        <rect x="42" y="54" width="46" height="28" rx="6" fill="#D5EDD8" />
        <rect x="210" y="62" width="38" height="24" rx="5" fill="#D5EDD8" />
        {/* Street Grid */}
        <g stroke="#FFFFFF" strokeWidth="3">
          <line x1="0" y1="62" x2="360" y2="52" />
          <line x1="0" y1="98" x2="360" y2="90" />
          <line x1="88" y1="20" x2="96" y2="140" />
          <line x1="168" y1="20" x2="158" y2="140" />
          <line x1="252" y1="20" x2="244" y2="140" />
        </g>
        {/* Arterial Route */}
        <path
          d="M18 118 Q 120 88, 178 74 T 320 42"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Medical Campus Building Footprint */}
        <rect
          x="150"
          y="58"
          width="48"
          height="28"
          rx="4"
          fill="#FFFFFF"
          stroke="#006B5F"
          strokeWidth="1.5"
        />
        <text
          x="114"
          y="46"
          fill="#64748B"
          fontSize="9"
          fontFamily="sans-serif"
          fontWeight="600"
        >
          Boston
        </text>
      </svg>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 bg-[#002541]/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xs truncate">
          <MapPin className="w-3 h-3 text-[#6DF5E1] shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <span className="inline-flex items-center gap-1 bg-white/95 text-[#002541] border border-[#E2E8F0] text-[10px] font-semibold px-2 py-1 rounded-md shrink-0">
          <Navigation className="w-2.5 h-2.5 text-[#006B5F]" />
          0.8 mi
        </span>
      </div>
    </div>
  );
};

export const FastTrackQrCode: React.FC<{ code?: string }> = ({
  code = 'PID-88420-APT94',
}) => {
  const matrix = [
    '1111101011111',
    '1000100110001',
    '1010101010101',
    '1000101110001',
    '1111101011111',
    '0000001100000',
    '1011011011011',
    '0100100100100',
    '1111101011010',
    '1000100110111',
    '1010101101001',
    '1000101010110',
    '1111101101101',
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="p-3 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
        <svg viewBox="0 0 130 130" className="w-28 h-28" aria-label={`QR pass ${code}`}>
          <rect width="130" height="130" fill="#FFFFFF" />
          {matrix.map((row, r) =>
            row.split('').map((cell, c) =>
              cell === '1' ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * 10 + 1}
                  y={r * 10 + 1}
                  width="8"
                  height="8"
                  rx="1"
                  fill="#0B1C30"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <span className="mt-2 font-mono-tabular text-xs font-semibold text-[#0B1C30]">
        {code}
      </span>
    </div>
  );
};

export const EcgWaveform: React.FC = () => (
  <svg viewBox="0 0 180 48" className="w-24 h-10 bg-[#002541] rounded-lg p-1.5" aria-label="12-Lead ECG Sinus Rhythm">
    <path
      d="M 4 28 L 28 28 L 34 24 L 38 28 L 44 28 L 48 34 L 54 8 L 60 39 L 65 28 L 76 28 L 83 22 L 90 28 L 116 28 L 122 24 L 126 28 L 132 28 L 136 34 L 142 8 L 148 39 L 153 28 L 176 28"
      fill="none"
      stroke="#4FDBC8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MonthlyAppointmentsChart: React.FC<{
  mode: 'Monthly' | 'Quarterly' | 'Annual';
}> = ({ mode }) => {
  const dataMap = {
    Monthly: [
      { label: 'May (1,480)', base: 1120, extra: 360 },
      { label: 'Jun (1,560)', base: 1180, extra: 380 },
      { label: 'Jul (1,620)', base: 1210, extra: 410 },
      { label: 'Aug (1,710)', base: 1290, extra: 420 },
      { label: 'Sep (1,790)', base: 1360, extra: 430 },
      { label: 'Oct (1,840)', base: 1420, extra: 420 },
    ],
    Quarterly: [
      { label: 'Q1 (4,120)', base: 3100, extra: 1020 },
      { label: 'Q2 (4,580)', base: 3420, extra: 1160 },
      { label: 'Q3 (5,120)', base: 3860, extra: 1260 },
      { label: 'Q4 (5,410)', base: 4090, extra: 1320 },
    ],
    Annual: [
      { label: '2021', base: 12400, extra: 3800 },
      { label: '2022', base: 14100, extra: 4200 },
      { label: '2023', base: 16800, extra: 4900 },
      { label: '2024 YTD', base: 18400, extra: 5200 },
    ],
  };

  const items = dataMap[mode];
  const maxVal = Math.max(...items.map((i) => i.base + i.extra)) * 1.1;

  return (
    <div className="w-full pt-2">
      <div className="relative h-48 flex items-end justify-between gap-4 px-4 pb-2 border-b border-[#E2E8F0]">
        {/* Target Dashed Line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-[#EF4444]/60 pointer-events-none flex justify-end"
          style={{ bottom: '72%' }}
        >
          <span className="text-[10px] font-semibold text-[#DC2626] bg-white px-1.5 -mt-2.5 mr-2">
            TARGET (1,750)
          </span>
        </div>

        {items.map((item) => {
          const basePct = Math.round((item.base / maxVal) * 100);
          const extraPct = Math.round((item.extra / maxVal) * 100);
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-8 sm:w-10 flex flex-col justify-end h-full">
                <div
                  className="w-full bg-[#006B5F] rounded-t-md transition-all duration-300"
                  style={{ height: `${extraPct}%` }}
                  title={`New Consultations: ${item.extra}`}
                />
                <div
                  className="w-full bg-[#123B5D] transition-all duration-300"
                  style={{ height: `${basePct}%` }}
                  title={`Completed Appointments: ${item.base}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-4 px-4 pt-2">
        {items.map((item) => (
          <div key={item.label} className="flex-1 text-center text-[11px] font-medium text-[#64748B] font-mono-tabular truncate">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export const HeadacheSparkline: React.FC = () => (
  <div className="w-full">
    <svg viewBox="0 0 240 60" className="w-full h-14 overflow-visible" aria-label="7-Day Headache Frequency vs Screen Load">
      <line x1="0" y1="52" x2="240" y2="52" stroke="#E2E8F0" strokeWidth="1" />
      <path
        d="M 10 46 L 48 44 L 86 38 L 124 30 L 162 20 L 200 18 L 230 22"
        fill="none"
        stroke="#006B5F"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [10, 46],
        [48, 44],
        [86, 38],
        [124, 30],
        [162, 20],
        [200, 18],
        [230, 22],
      ].map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r="3" fill="#FFFFFF" stroke="#006B5F" strokeWidth="2" />
      ))}
    </svg>
    <div className="flex items-center justify-between text-[10px] text-[#64748B] font-medium mt-1">
      <span>Mon</span>
      <span>Tue</span>
      <span>Wed</span>
      <span>Thu</span>
      <span>Fri</span>
      <span>Sat</span>
      <span>Today</span>
    </div>
  </div>
);
