import type { UserData } from "@/types/helpers";

export type Action = {
    type: 'SET_DATA'
    payload: UserData
} | {
    type: 'SET_HOLDINGS'
    payload: UserData['holdings']
} | {
    type: 'INSERT_HOLDING'
    payload: UserData['holdings'][number]
} | {
    type: 'UPDATE_HOLDING'
    payload: UserData['holdings'][number]
} | {
    type: 'DELETE_HOLDING'
    payload: UserData['holdings'][number]
} | {
    type: 'UPDATE_PROFILE'
    payload: UserData['profile']
}

export function GlobalReducer(state: UserData | null, action: Action) {
    if (!state) {
        if (action.type === 'SET_DATA') {
            return action.payload;
        }
        return null;
    };

    switch (action.type) {
        case 'SET_HOLDINGS': {
            return {
                ...state,
                holdings: action.payload,
            }
        }

        case 'INSERT_HOLDING': {
            return {
                ...state,
                holdings: [
                    ...state.holdings,
                    action.payload
                ],
            }
        }

        case 'UPDATE_HOLDING': {
            return {
                ...state,
                holdings: state.holdings.map((holding) => {
                    if (holding.stockId === action.payload.stockId) {
                        return action.payload;
                    }
                    return holding;
                }),
            }
        }

        case 'DELETE_HOLDING': {
            return {
                ...state,
                holdings: state.holdings.filter((holding) => holding.stockId !== action.payload.stockId),
            }
        }

        case 'UPDATE_PROFILE': {
            if (!action.payload) return state;
            return {
                ...state,
                profile: {
                    ...(state.profile? state.profile: {}),
                    ...action.payload,
                }
            }
        }

        default:
            return state;
    }
}