/**
 * Sparkle crosses scattered over the hero title — copied verbatim from
 * docs/nfz_mermaidcore.html (.title-sparkles), HTML attributes → JSX.
 */
export function TitleSparkles() {
  return (
    <span className="title-sparkles" aria-hidden="true">
      <span className="ts">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <defs>
            <linearGradient id="ts1" x1="0" y1="0" x2="14" y2="14">
              <stop stopColor="#f472b6" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <line x1="7" y1="0" x2="7" y2="14" stroke="url(#ts1)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="7" x2="14" y2="7" stroke="url(#ts1)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="2" y1="2" x2="12" y2="12" stroke="url(#ts1)" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
          <line x1="12" y1="2" x2="2" y2="12" stroke="url(#ts1)" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
          <circle cx="7" cy="7" r="1.5" fill="#f472b6" />
        </svg>
      </span>
      <span className="ts">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="5" y1="0" x2="5" y2="10" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="5" x2="10" y2="5" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="5" cy="5" r="1.2" fill="#f9a8d4" />
        </svg>
      </span>
      <span className="ts">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <defs>
            <linearGradient id="ts3" x1="0" y1="0" x2="18" y2="18">
              <stop stopColor="#c084fc" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <line x1="9" y1="0" x2="9" y2="18" stroke="url(#ts3)" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="9" x2="18" y2="9" stroke="url(#ts3)" strokeWidth="2" strokeLinecap="round" />
          <line x1="2.5" y1="2.5" x2="15.5" y2="15.5" stroke="url(#ts3)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          <line x1="15.5" y1="2.5" x2="2.5" y2="15.5" stroke="url(#ts3)" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          <circle cx="9" cy="9" r="2" fill="#c084fc" />
        </svg>
      </span>
      <span className="ts">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <line x1="5.5" y1="0" x2="5.5" y2="11" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="5.5" x2="11" y2="5.5" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="5.5" cy="5.5" r="1.1" fill="#fda4af" />
        </svg>
      </span>
      <span className="ts">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <defs>
            <linearGradient id="ts5" x1="0" y1="0" x2="16" y2="16">
              <stop stopColor="#e879f9" />
              <stop offset="1" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
          <line x1="8" y1="0" x2="8" y2="16" stroke="url(#ts5)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="url(#ts5)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="2" y1="2" x2="14" y2="14" stroke="url(#ts5)" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
          <line x1="14" y1="2" x2="2" y2="14" stroke="url(#ts5)" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
          <circle cx="8" cy="8" r="1.7" fill="#e879f9" />
        </svg>
      </span>
      <span className="ts">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <line x1="4.5" y1="0" x2="4.5" y2="9" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="0" y1="4.5" x2="9" y2="4.5" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="4.5" cy="4.5" r="1" fill="#c4b5fd" />
        </svg>
      </span>
      <span className="ts">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <line x1="6.5" y1="0" x2="6.5" y2="13" stroke="#f9a8d4" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="0" y1="6.5" x2="13" y2="6.5" stroke="#f9a8d4" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="6.5" cy="6.5" r="1.3" fill="#fecdd3" />
        </svg>
      </span>
      <span className="ts">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <line x1="6" y1="0" x2="6" y2="12" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="6" x2="12" y2="6" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="6" cy="6" r="1.2" fill="#ddd6fe" />
        </svg>
      </span>
      <span className="ts">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <defs>
            <linearGradient id="ts9" x1="0" y1="0" x2="15" y2="15">
              <stop stopColor="#f472b6" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <line x1="7.5" y1="0" x2="7.5" y2="15" stroke="url(#ts9)" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="0" y1="7.5" x2="15" y2="7.5" stroke="url(#ts9)" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="2" y1="2" x2="13" y2="13" stroke="url(#ts9)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          <line x1="13" y1="2" x2="2" y2="13" stroke="url(#ts9)" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          <circle cx="7.5" cy="7.5" r="1.6" fill="#f472b6" />
        </svg>
      </span>
      <span className="ts">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="5" y1="0" x2="5" y2="10" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="0" y1="5" x2="10" y2="5" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="5" cy="5" r="1.1" fill="#c7d2fe" />
        </svg>
      </span>
    </span>
  );
}
