interface Group {
	name: string;
	id: number;
	tickers: Ticker[];
}

interface Ticker {
	name: string;
	group_id: number;
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
