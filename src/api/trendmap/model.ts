interface Ticker {
	name: string;
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
export type { Ticker };
