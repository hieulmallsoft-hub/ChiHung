import { Client } from "@stomp/stompjs";
import { WS_BASE_URL } from "../api/axiosClient";
import { tokenStorage } from "./storage";

export function toWebSocketUrl(baseHttpUrl) {
  const base = String(baseHttpUrl || "").replace(/\/$/, "");

  if (base.startsWith("https://")) {
    return `wss://${base.slice("https://".length)}/ws`;
  }

  if (base.startsWith("http://")) {
    return `ws://${base.slice("http://".length)}/ws`;
  }

  return `${base}/ws`;
}

export const WS_STOMP_URL = toWebSocketUrl(WS_BASE_URL);

export function createChatStompClient(callbacks = {}) {
  const defaultHeaders = () => {
    const accessToken = tokenStorage.getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  };

  const client = new Client({
    brokerURL: WS_STOMP_URL,
    reconnectDelay: 4000,
    connectHeaders: {
      ...defaultHeaders(),
      ...(callbacks.connectHeaders || {}),
    },
    ...callbacks,
  });

  const originalBeforeConnect = client.beforeConnect;
  client.beforeConnect = async () => {
    client.connectHeaders = {
      ...defaultHeaders(),
      ...(callbacks.connectHeaders || {}),
    };
    if (originalBeforeConnect) {
      await originalBeforeConnect();
    }
  };

  return client;
}

export function mergeMessageList(previousMessages, incomingMessage) {
  if (!incomingMessage?.id) {
    return previousMessages;
  }

  const index = previousMessages.findIndex((item) => item.id === incomingMessage.id);
  if (index === -1) {
    return [...previousMessages, incomingMessage];
  }

  const next = [...previousMessages];
  next[index] = { ...next[index], ...incomingMessage };
  return next;
}
