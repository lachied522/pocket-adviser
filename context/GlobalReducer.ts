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
    payload: UserData['holdings'][number]['id']
} | {
    type: 'UPDATE_PROFILE'
    payload: UserData['profile']
} | {
    type: 'INSERT_CONVERSATION_START'
    payload: UserData['conversations'][number]
} | {
    type: 'INSERT_CONVERSATION_END'
    payload: UserData['conversations'][number]
} | {
    type: 'UPDATE_CONVERSATION'
    payload: UserData['conversations'][number]
} | {
    type: 'DELETE_CONVERSATION'
    payload: UserData['conversations'][number]['id']
}

export function GlobalReducer(state: UserData, action: Action) {
    switch (action.type) {
        case 'SET_DATA': {
            return action.payload;
        }

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
                holdings: state.holdings.filter((holding) => holding.stockId !== action.payload),
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

        case 'INSERT_CONVERSATION_START': {
            return {
                ...state,
                conversations: [action.payload, ...state.conversations]
            }
        }

        case 'INSERT_CONVERSATION_END': {
            return {
                ...state,
                conversations: [...state.conversations, action.payload]
            }
        }

        case 'UPDATE_CONVERSATION': {
            return {
                ...state,
                conversations: state.conversations.map((conversation) => {
                    if (conversation.id === action.payload.id) {
                        return {
                            ...conversation,
                            ...action.payload,
                        }
                    }
                    return conversation;
                })
            }
        }

        case 'DELETE_CONVERSATION': {
            return {
                ...state,
                conversations: state.conversations.filter((converastion) => converastion.id !== action.payload),
            }
        }

        default:
            return state;
    }
}