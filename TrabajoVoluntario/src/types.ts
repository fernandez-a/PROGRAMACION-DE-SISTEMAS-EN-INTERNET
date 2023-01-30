export type Usuario = {
    _id: string,
    usuario:string
    email: string,
    token: string
}
export type Message = {
    sala:string
    user: string,
    message:string
}

export type SubsMessage = {
    name:string
    user: string,
    message:string
}

export type Sala = {
    sala:string,
    users:string[],
}