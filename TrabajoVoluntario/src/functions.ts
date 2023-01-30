import { Sala, Message, Usuario } from "./types"

export let messages: Message[] = []
export let chats: Sala[] = [];
export const messageUpdate = (mensaje: Message): void => {
    messages.push(mensaje);
}

export const deleteChannel = (sala: string): void => {
    chats = chats.filter((chat) => chat.sala !== sala);
}