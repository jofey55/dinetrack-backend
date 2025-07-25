export function ZawadiLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main circle background */}
      <circle cx="50" cy="50" r="45" fill="currentColor" className="text-primary" />
      
      {/* Inner document/clipboard shape */}
      <rect x="30" y="25" width="40" height="50" rx="4" fill="white" />
      
      {/* Document lines representing inventory items */}
      <rect x="35" y="35" width="30" height="3" rx="1.5" fill="currentColor" className="text-primary" />
      <rect x="35" y="42" width="25" height="3" rx="1.5" fill="currentColor" className="text-primary" />
      <rect x="35" y="49" width="20" height="3" rx="1.5" fill="currentColor" className="text-primary" />
      <rect x="35" y="56" width="30" height="3" rx="1.5" fill="currentColor" className="text-primary" />
      <rect x="35" y="63" width="22" height="3" rx="1.5" fill="currentColor" className="text-primary" />
      
      {/* Small checkmark or indicator */}
      <circle cx="60" cy="30" r="3" fill="currentColor" className="text-green-500" />
    </svg>
  );
}