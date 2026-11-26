import { makeMutable } from "react-native-reanimated";

// One pair of values drives the take-off everywhere: the hero card, the tab bar and the flight view all read them,
// which is why the drone can leave one screen and arrive in another without a cut.

/** 0 on the ground, 1 hovering above the card, 2 gone into the flight view. */
export const flight = makeMutable(0);
/** 0 propellers still, 1 at full speed. */
export const spin = makeMutable(0);
