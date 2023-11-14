import { atomWithStorage } from "jotai/utils";

export const votedPollsAtom = atomWithStorage<string[]>("voted_polls", []);
