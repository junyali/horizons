export type NavDirection = 'up' | 'down' | 'left' | 'right';

/** Parse a keyboard event key into a navigation direction, or null. */
export function parseNavKey(key: string): NavDirection | null {
	switch (key) {
		case 'w': case 'W': case 'ArrowUp': return 'up';
		case 's': case 'S': case 'ArrowDown': return 'down';
		case 'a': case 'A': case 'ArrowLeft': return 'left';
		case 'd': case 'D': case 'ArrowRight': return 'right';
		default: return null;
	}
}

/** Check if a key is any navigation-related key (WASD, arrows, Enter, Escape, Tab). */
export function isNavKey(key: string): boolean {
	return parseNavKey(key) !== null || ['Enter', 'Escape', 'Tab'].includes(key);
}

/** Clamp an index within [0, max]. */
export function clampIndex(index: number, max: number): number {
	return Math.max(0, Math.min(max, index));
}

interface ListNavOptions {
	/** Total number of items (reactive getter). */
	count: () => number;
	/** Called when Enter is pressed on the selected item. */
	onSelect?: (index: number) => void;
	/** Called when Escape is pressed. */
	onEscape?: () => void;
	/** Called after the selected index changes from keyboard or wheel input. */
	onChange?: (index: number) => void;
	/** Enable wheel-to-scroll navigation. Pass a number to set the threshold (default 80). */
	wheel?: boolean | number;
	/** Starting index (default 0). */
	initial?: number;
}

/**
 * Composable for 1D WASD list navigation.
 * Handles W/S + Arrow Up/Down, Enter, Escape, and optional wheel scroll.
 */
export function createListNav(options: ListNavOptions) {
	let selectedIndex = $state(options.initial ?? 0);
	let usingKeyboard = $state(true);
	let wheelAccumulator = 0;
	const wheelThreshold = typeof options.wheel === 'number' ? options.wheel : 80;

	function move(delta: number) {
		selectedIndex = clampIndex(selectedIndex + delta, options.count() - 1);
		options.onChange?.(selectedIndex);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isNavKey(e.key)) {
			usingKeyboard = true;
		}

		const dir = parseNavKey(e.key);
		if (dir === 'up') {
			e.preventDefault();
			move(-1);
		} else if (dir === 'down') {
			e.preventDefault();
			move(1);
		} else if (e.key === 'Enter') {
			options.onSelect?.(selectedIndex);
		} else if (e.key === 'Escape') {
			options.onEscape?.();
		}
	}

	function handleWheel(e: WheelEvent) {
		if (!options.wheel) return;
		e.preventDefault();
		wheelAccumulator += e.deltaY;

		if (wheelAccumulator > wheelThreshold) {
			wheelAccumulator = 0;
			move(1);
		} else if (wheelAccumulator < -wheelThreshold) {
			wheelAccumulator = 0;
			move(-1);
		}
	}

	/** Select an index via mouse (sets usingKeyboard = false). */
	function select(index: number) {
		usingKeyboard = false;
		selectedIndex = index;
	}

	return {
		get selectedIndex() { return selectedIndex; },
		set selectedIndex(v: number) { selectedIndex = v; },
		get usingKeyboard() { return usingKeyboard; },
		set usingKeyboard(v: boolean) { usingKeyboard = v; },
		handleKeydown,
		handleWheel,
		select,
	};
}

interface GridNavOptions {
	/** Array of column sizes, e.g. [2, 3] for col 0 with 2 rows, col 1 with 3 rows. */
	columns: () => number[];
	/** Called when Enter is pressed. Receives (col, row). */
	onSelect?: (col: number, row: number) => void;
	/** Called when Escape is pressed. */
	onEscape?: () => void;
}

/**
 * Composable for 2D WASD grid navigation.
 * W/S moves within a column, A/D switches columns (clamping row to new column size).
 */
export function createGridNav(options: GridNavOptions) {
	let col = $state(0);
	let row = $state(0);
	let usingKeyboard = $state(true);

	function handleKeydown(e: KeyboardEvent) {
		if (isNavKey(e.key)) usingKeyboard = true;

		const dir = parseNavKey(e.key);
		const cols = options.columns();

		if (dir === 'up') {
			e.preventDefault();
			row = clampIndex(row - 1, cols[col] - 1);
		} else if (dir === 'down') {
			e.preventDefault();
			row = clampIndex(row + 1, cols[col] - 1);
		} else if (dir === 'left') {
			e.preventDefault();
			col = clampIndex(col - 1, cols.length - 1);
			row = clampIndex(row, cols[col] - 1);
		} else if (dir === 'right') {
			e.preventDefault();
			col = clampIndex(col + 1, cols.length - 1);
			row = clampIndex(row, cols[col] - 1);
		} else if (e.key === 'Enter') {
			options.onSelect?.(col, row);
		} else if (e.key === 'Escape') {
			options.onEscape?.();
		}
	}

	/** Select a cell via mouse (sets usingKeyboard = false). */
	function select(c: number, r: number) {
		usingKeyboard = false;
		col = c;
		row = r;
	}

	function isSelected(c: number, r: number): boolean {
		return col === c && row === r;
	}

	return {
		get col() { return col; },
		set col(v: number) { col = v; },
		get row() { return row; },
		set row(v: number) { row = v; },
		get usingKeyboard() { return usingKeyboard; },
		set usingKeyboard(v: boolean) { usingKeyboard = v; },
		handleKeydown,
		select,
		isSelected,
	};
}
