import type { UserData } from "@/types/helpers";

export type Action = {
    type: 'SET_DATA'
    payload: UserData
} | {
    type: 'INSERT_CONVERSATION'
    payload: UserData['conversations'][number]
} | {
    type: 'UPDATE_CONVERSATION_NAME'
    payload: {
        id: string,
        name: string,
    }
} | {
    type: 'DELETE_CONVERSATION'
    payload: UserData['conversations'][number]['id']
} | {
    type: 'COMPLETE_LESSON'
    payload: {
        title: string,
        value: string,
    }
}

export function GlobalReducer(state: UserData, action: Action) {
    switch (action.type) {
        case 'SET_DATA': {
            return action.payload;
        }

        case 'INSERT_CONVERSATION': {
            return {
                ...state,
                conversations: [
                    action.payload,
                    // eliminate duplicate ids
                    ...state.conversations.filter((conversation) => conversation.id !== action.payload.id)
                ]
            }
        }

        case 'UPDATE_CONVERSATION_NAME': {
            return {
                ...state,
                conversations: state.conversations.map((conversation) => {
                    if (conversation.id === action.payload.id) {
                        return {
                            ...conversation,
                            name: action.payload.name,
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

        case 'COMPLETE_LESSON': {
            return {
                ...state,
                lessons: {
                    ...state.lessons as any, // TO DO
                    [action.payload.title]: action.payload.value
                }
            }
        }

        default:
            return state;
    }
}