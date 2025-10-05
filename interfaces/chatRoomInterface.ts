import { Socket } from "socket.io-client";
import { DefaultEventsMap } from '@socket.io/component-emitter';

export default interface chatRoomParamsInterface {
    user: {
        userName: string,
        userImage: string
        userId: string;
        lastSeen?: string;
    }
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | null
}