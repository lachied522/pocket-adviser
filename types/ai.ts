


export interface Message {
    content: string | null
    name?: string // name of function to call if any
    role: "custom"|"system"|"user"|"assistant"|"tool",
    tool_call?: any[]
}