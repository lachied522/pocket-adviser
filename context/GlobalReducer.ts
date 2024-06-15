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
                    if (holding.id === action.payload.id) {
                        return action.payload;
                    }
                    return holding;
                }),
            }
        }

        case 'DELETE_HOLDING': {
            return {
                ...state,
                holdings: state.holdings.filter((holding) => holding.id !== action.payload.id),
            }
        }

        default:
            return state;
    }
}