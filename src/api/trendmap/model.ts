interface Group {
	name: string;
	tickers: Map<string, Ticker>;
}

interface Ticker {
	name: string;
	group_id: string;
	long_term: Trend;
	mid_term: Trend;
	short_term: Trend;
}

enum Trend {
	Up = 'Up',
	Down = 'Down',
	Range = 'Range',
	Unk = 'Unk'
}

export { Trend };
export type { Ticker, Group };
