import type { GlobalState } from "./GlobalContext";

export type Action = {
    type: 'SET_DATA'
    payload: GlobalState['state']
} | {
    type: 'SET_PORTFOLIO'
    payload: GlobalState['state']['portfolio']
} | {
    type: 'INSERT_HOLDING'
    payload: GlobalState['state']['portfolio'][number]
} | {
    type: 'UPDATE_HOLDING'
    payload: GlobalState['state']['portfolio'][number]
} | {
    type: 'DELETE_HOLDING'
    payload: GlobalState['state']['portfolio'][number]
}

export function GlobalReducer(state: GlobalState['state'], action: Action) {
    switch(action.type) {
        case 'SET_DATA': {
            return action.payload;
        }

        case 'SET_PORTFOLIO': {
            return {
                ...state,
                portfolio: action.payload,
            }
        }

        case 'INSERT_HOLDING': {
            return {
                ...state,
                portfolio: [
                    ...state.portfolio,
                    action.payload
                ],
            }
        }

        case 'UPDATE_HOLDING': {
            return {
                ...state,
                portfolio: state.portfolio.map((holding) => {
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
                portfolio: state.portfolio.filter((holding) => holding.id !== action.payload.id),
            }
        }

        default:
            return state;
    }
}