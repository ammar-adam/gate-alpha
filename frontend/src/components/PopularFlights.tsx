/** 15 hardcoded US/Canada routes; on-time % from BTS-style stats; click loads flight (today). */
interface PopularFlight {
  ident: string
  route: string
  airline: string
  onTimePct: number
}

const POPULAR: PopularFlight[] = [
  { ident: 'UA4469', route: 'Newark → LAX', airline: 'United', onTimePct: 72 },
  { ident: 'UA101', route: 'Newark → LAX', airline: 'United', onTimePct: 78 },
  { ident: 'AA100', route: 'JFK → Miami', airline: 'American', onTimePct: 81 },
  { ident: 'AA200', route: 'JFK → Miami', airline: 'American', onTimePct: 76 },
  { ident: 'DL404', route: 'Atlanta → JFK', airline: 'Delta', onTimePct: 85 },
  { ident: 'DL500', route: 'Atlanta → LAX', airline: 'Delta', onTimePct: 82 },
  { ident: 'AC123', route: 'Toronto → Vancouver', airline: 'Air Canada', onTimePct: 79 },
  { ident: 'AC456', route: 'Toronto → Montreal', airline: 'Air Canada', onTimePct: 84 },
  { ident: 'WN200', route: 'BWI → Chicago', airline: 'Southwest', onTimePct: 77 },
  { ident: 'B6123', route: 'JFK → Boston', airline: 'JetBlue', onTimePct: 80 },
  { ident: 'UA300', route: 'SFO → Seattle', airline: 'United', onTimePct: 83 },
  { ident: 'AA300', route: 'Dallas → Chicago', airline: 'American', onTimePct: 74 },
  { ident: 'DL600', route: 'Detroit → Orlando', airline: 'Delta', onTimePct: 86 },
  { ident: 'AS100', route: 'Seattle → San Diego', airline: 'Alaska', onTimePct: 88 },
  { ident: 'UA800', route: 'Houston → Newark', airline: 'United', onTimePct: 71 },
]

interface PopularFlightsProps {
  onSelect: (ident: string) => void
}

export function PopularFlights({ onSelect }: PopularFlightsProps) {
  return (
    <div className="mb-4">
      <h2 className="mb-2 text-[0.7rem] font-medium uppercase tracking-widest text-[#999999]">
        Popular flights
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {POPULAR.map((f) => (
          <button
            key={`${f.ident}-${f.route}`}
            type="button"
            onClick={() => onSelect(f.ident)}
            className="shrink-0 rounded-lg border border-[#1f1f1f] bg-[#111111] px-3 py-2 text-left text-sm hover:border-[#f5a623]"
          >
            <span className="font-mono font-semibold text-[#ffffff]">{f.ident}</span>
            <span className="mx-1.5 text-[#666666]">·</span>
            <span className="text-[#999999]">{f.route}</span>
            <span className="ml-1.5 text-xs text-[#666666]">{f.onTimePct}% on-time</span>
          </button>
        ))}
      </div>
    </div>
  )
}
