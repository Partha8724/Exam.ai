export default function KnowledgeLogo({ size = 48, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="47" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" />
      
      {/* Inner geometric pattern - knowledge star */}
      <path
        d="M50 15 L58 38 L82 38 L63 52 L70 75 L50 62 L30 75 L37 52 L18 38 L42 38 Z"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="1.5"
        opacity="0.3"
      />
      
      {/* Open Book shape */}
      <path
        d="M30 55 C30 45 38 35 50 32 C62 35 70 45 70 55"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Book spine */}
      <line x1="50" y1="32" x2="50" y2="62" stroke="url(#goldGrad)" strokeWidth="2" />
      {/* Left pages */}
      <path d="M34 52 C34 46 40 39 50 37" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.5" />
      <path d="M37 50 C37 46 42 41 50 39" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.3" />
      {/* Right pages */}
      <path d="M66 52 C66 46 60 39 50 37" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.5" />
      <path d="M63 50 C63 46 58 41 50 39" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.3" />
      
      {/* Brain/lightbulb glow on top */}
      <circle cx="50" cy="25" r="6" fill="url(#goldGrad)" opacity="0.15" />
      <circle cx="50" cy="25" r="3" fill="url(#goldGrad)" opacity="0.4" />
      
      {/* Bottom laurel accents */}
      <path d="M35 65 C30 72 33 78 40 75 C34 73 33 68 35 65Z" fill="url(#goldGrad)" opacity="0.4" />
      <path d="M65 65 C70 72 67 78 60 75 C66 73 67 68 65 65Z" fill="url(#goldGrad)" opacity="0.4" />
      <path d="M38 70 C34 75 37 80 43 78 C38 77 37 73 38 70Z" fill="url(#goldGrad)" opacity="0.3" />
      <path d="M62 70 C66 75 63 80 57 78 C62 77 63 73 62 70Z" fill="url(#goldGrad)" opacity="0.3" />
      
      {/* Gold gradient */}
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#F5D87A" />
          <stop offset="100%" stopColor="#B87333" />
        </linearGradient>
      </defs>
    </svg>
  );
}
