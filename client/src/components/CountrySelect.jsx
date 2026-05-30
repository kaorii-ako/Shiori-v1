import { forwardRef } from 'react'

const countries = [
  { name: 'United States', timezone: 'America/New_York', code: 'US' },
  { name: 'United Kingdom', timezone: 'Europe/London', code: 'GB' },
  { name: 'Canada', timezone: 'America/Toronto', code: 'CA' },
  { name: 'Australia', timezone: 'Australia/Sydney', code: 'AU' },
  { name: 'Japan', timezone: 'Asia/Tokyo', code: 'JP' },
  { name: 'China', timezone: 'Asia/Shanghai', code: 'CN' },
  { name: 'India', timezone: 'Asia/Kolkata', code: 'IN' },
  { name: 'Germany', timezone: 'Europe/Berlin', code: 'DE' },
  { name: 'France', timezone: 'Europe/Paris', code: 'FR' },
  { name: 'Italy', timezone: 'Europe/Rome', code: 'IT' },
  { name: 'Spain', timezone: 'Europe/Madrid', code: 'ES' },
  { name: 'Netherlands', timezone: 'Europe/Amsterdam', code: 'NL' },
  { name: 'Belgium', timezone: 'Europe/Brussels', code: 'BE' },
  { name: 'Switzerland', timezone: 'Europe/Zurich', code: 'CH' },
  { name: 'Austria', timezone: 'Europe/Vienna', code: 'AT' },
  { name: 'Poland', timezone: 'Europe/Warsaw', code: 'PL' },
  { name: 'Sweden', timezone: 'Europe/Stockholm', code: 'SE' },
  { name: 'Norway', timezone: 'Europe/Oslo', code: 'NO' },
  { name: 'Denmark', timezone: 'Europe/Copenhagen', code: 'DK' },
  { name: 'Finland', timezone: 'Europe/Helsinki', code: 'FI' },
  { name: 'Portugal', timezone: 'Europe/Lisbon', code: 'PT' },
  { name: 'Ireland', timezone: 'Europe/Dublin', code: 'IE' },
  { name: 'New Zealand', timezone: 'Pacific/Auckland', code: 'NZ' },
  { name: 'Singapore', timezone: 'Asia/Singapore', code: 'SG' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', code: 'HK' },
  { name: 'South Korea', timezone: 'Asia/Seoul', code: 'KR' },
  { name: 'Taiwan', timezone: 'Asia/Taipei', code: 'TW' },
  { name: 'Thailand', timezone: 'Asia/Bangkok', code: 'TH' },
  { name: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', code: 'MY' },
  { name: 'Philippines', timezone: 'Asia/Manila', code: 'PH' },
  { name: 'Indonesia', timezone: 'Asia/Jakarta', code: 'ID' },
  { name: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', code: 'VN' },
  { name: 'Brazil', timezone: 'America/Sao_Paulo', code: 'BR' },
  { name: 'Argentina', timezone: 'America/Buenos_Aires', code: 'AR' },
  { name: 'Mexico', timezone: 'America/Mexico_City', code: 'MX' },
  { name: 'Chile', timezone: 'America/Santiago', code: 'CL' },
  { name: 'Colombia', timezone: 'America/Bogota', code: 'CO' },
  { name: 'Peru', timezone: 'America/Lima', code: 'PE' },
  { name: 'Russia', timezone: 'Europe/Moscow', code: 'RU' },
  { name: 'Turkey', timezone: 'Europe/Istanbul', code: 'TR' },
  { name: 'Saudi Arabia', timezone: 'Asia/Riyadh', code: 'SA' },
  { name: 'United Arab Emirates', timezone: 'Asia/Dubai', code: 'AE' },
  { name: 'Israel', timezone: 'Asia/Jerusalem', code: 'IL' },
  { name: 'Egypt', timezone: 'Africa/Cairo', code: 'EG' },
  { name: 'South Africa', timezone: 'Africa/Johannesburg', code: 'ZA' },
  { name: 'Nigeria', timezone: 'Africa/Lagos', code: 'NG' },
  { name: 'Kenya', timezone: 'Africa/Nairobi', code: 'KE' }
]

const CountrySelect = forwardRef(({
  value,
  onChange,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`relative ${className}`}>
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        className={`
          input-glass w-full appearance-none cursor-pointer
          ${error ? 'border-accent-danger' : ''}
        `}
        style={{
          fontFamily: 'VT323',
          fontSize: '18px',
          paddingRight: '2rem',
          background: 'rgba(24,28,36,0.9)',
          color: '#dfe2eb',
          colorScheme: 'dark',
        }}
        {...props}
      >
        <option value="">SELECT COUNTRY</option>
        {countries.map((country) => (
          <option key={country.code} value={country.name}>
            {country.name}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: '#606080' }}
      >
        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>
    </div>
  )
})

CountrySelect.displayName = 'CountrySelect'

// Helper to get timezone from country name
export const getTimezoneFromCountry = (countryName) => {
  const country = countries.find(c => c.name === countryName)
  return country?.timezone || 'UTC'
}

export default CountrySelect
