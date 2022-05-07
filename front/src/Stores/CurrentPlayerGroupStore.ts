import { writable } from "svelte/store";

export const currentPlayerGroupIdStore = writable<int | undefined>(undefined);

export const currentPlayerGroupLockStateStore = writable<boolean | undefined>(undefined);
