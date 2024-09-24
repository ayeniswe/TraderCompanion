import { writable } from 'svelte/store';

/**
 * Create a writable Svelte store wrapper for common array APIs
 */
function createArrayStore<T>() {
    const { subscribe, set, update } = writable<T[]>([]);

    return {
        subscribe,
        add(item: T) {
            update((array) => [...array, item]);
        },
        set(idx: number, item: T) {
            update((array) => {
                const newArray = [...array];
                newArray[idx] = item;
                return newArray;
            });
        },
        remove(index: number) {
            update((array) => array.filter((_, i) => i !== index));
        },
        restore(groups: T[]) {
            set(groups);
        },
        clear() {
            set([]);
        },
        get(idx: number) {
            let value: T | undefined;
            subscribe((array) => {
                value = array[idx];
            })();
            return value; 
        }
    };
}

/**
 * Create a writable svelte store wrapper for common
 * map apis
 */
function createMapStore<K, V>() {
	const { subscribe, set, update } = writable(new Map<K, V>());

	return {
		subscribe,
		set(key: K, value: V) {
			update((map) => {
				const newMap = new Map(map); // Create a copy of the current map
				newMap.set(key, value); // Set the new key-value pair
				return newMap;
			});
		},
		delete(key: K) {
			update((map) => {
				const newMap = new Map(map); // Create a copy of the current map
				newMap.delete(key); // Remove the key
				return newMap;
			});
		},
		get(key: K) {
			let value: V | undefined;
			subscribe((map) => {
				value = map.get(key);
			})();
			return value;
		},
		clear() {
			set(new Map<K, V>());
		}
	};
}

/**
 * Generates a random 16-digit unique identfier.
 */
function generateUID() {
	// The minimum value for a 16-digit number
	const min = 1000000000000000n; // 10^15

	// The maximum value for a 16-digit number
	const max = 10000000000000000n; // 10^16

	// Generate a random 16-digit number
	const randomNumber = BigInt(Math.floor(Math.random() * Number(max - min))) + min;

	return Number(randomNumber);
}

export { createMapStore, generateUID, createArrayStore };
