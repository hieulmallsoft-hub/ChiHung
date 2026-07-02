import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, RefreshCw, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { chatApi } from "../../api/chatApi";
import { createChatStompClient, mergeMessageList } from "../../utils/chatSocket";
import { useAuth } from "../../hooks/useAuth";

export default function FloatingChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [connectionError, setConnectionError] = useState("");

  const stompRef = useRef(null);
  const pollingRef = useRef(null);
  const bootstrappingRef = useRef(false);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async (targetRoomId, { silent = false } = {}) => {
    try {
      const response = await chatApi.getMessages(targetRoomId, { page: 0, size: 50 });
      setMessages(response.data?.data?.content || []);
      return true;
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || "Không tải được lịch sử chat");
      }
      return false;
    }
  }, []);

  const connectSocket = useCallback(
    (targetRoomId) => {
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }

      const client = createChatStompClient({
        onConnect: () => {
          setStatus("connected");
          setConnectionError("");
          client.subscribe(`/topic/chat/${targetRoomId}`, (frame) => {
            const incoming = JSON.parse(frame.body);
            setMessages((previous) => mergeMessageList(previous, incoming));
          });
        },
        onStompError: () => setStatus("fallback"),
        onWebSocketClose: () => setStatus("fallback"),
        onWebSocketError: () => setStatus("fallback"),
      });

      client.activate();
      stompRef.current = client;
    },
    []
  );

  const initializeChat = useCallback(
    async ({ silent = false } = {}) => {
      if (!user?.email || bootstrappingRef.current) return "";

      try {
        bootstrappingRef.current = true;
        setStatus("connecting");
        setConnectionError("");

        const response = await chatApi.openRoom();
        const nextRoomId = response.data?.data?.id;
        if (!nextRoomId) throw new Error("missing-room-id");

        setRoomId(nextRoomId);
        await loadMessages(nextRoomId, { silent: true });
        chatApi.markRead(nextRoomId).catch(() => undefined);
        connectSocket(nextRoomId);
        return nextRoomId;
      } catch (error) {
        const message = error?.response?.data?.message || "Không thể kết nối chat";
        setStatus("idle");
        setConnectionError(message);
        if (!silent) {
          toast.error(message);
        }
        return "";
      } finally {
        bootstrappingRef.current = false;
      }
    },
    [connectSocket, loadMessages, user?.email]
  );

  const openChat = async () => {
    setOpen(true);
    if (!roomId) {
      await initializeChat({ silent: false });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || !roomId) return;
    chatApi.markRead(roomId).catch(() => undefined);
  }, [open, roomId]);

  useEffect(() => {
    if (!roomId || status === "connected") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      return;
    }

    pollingRef.current = setInterval(() => {
      loadMessages(roomId, { silent: true });
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [loadMessages, roomId, status]);

  useEffect(() => {
    return () => {
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!content.trim()) return;

    const targetRoomId = roomId || (await initializeChat({ silent: false }));
    if (!targetRoomId) return;

    const messageContent = content.trim();
    try {
      if (status === "connected" && stompRef.current?.connected) {
        stompRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify({ roomId: targetRoomId, content: messageContent }),
        });
      } else {
        const response = await chatApi.sendMessage({ roomId: targetRoomId, content: messageContent });
        const sentMessage = response?.data?.data;
        if (sentMessage) {
          setMessages((previous) => mergeMessageList(previous, sentMessage));
        }
      }

      setContent("");
      setConnectionError("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  };

  if (!user?.email) {
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
      >
        <MessageCircle size={18} aria-hidden="true" />
        Chat hỗ trợ
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-2xl md:right-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 text-white">
        <div>
          <p className="font-semibold">Hỗ trợ trực tuyến</p>
          <p className="text-[11px] text-cyan-50">Nhắn trực tiếp với quản trị viên</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status === "connected" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
            {status === "connected" ? "Real-time" : status === "connecting" ? "Đang nối" : "Dự phòng"}
          </span>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 transition hover:bg-white/15" aria-label="Đóng chat">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="h-80 space-y-2 overflow-y-auto bg-gradient-to-b from-cyan-50 to-white p-3">
        {connectionError && !roomId && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
            <p>{connectionError}</p>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 font-semibold text-red-700 hover:text-red-600"
              onClick={() => initializeChat({ silent: false })}
            >
              <RefreshCw size={13} aria-hidden="true" />
              Thử lại
            </button>
          </div>
        )}
        {messages.length === 0 && !connectionError && (
          <div className="rounded-xl border border-dashed border-cyan-200 bg-white/80 p-3 text-xs text-slate-500">
            Gửi nội dung cần hỗ trợ, quản trị viên sẽ phản hồi tại đây.
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.senderId === user?.id;
          const isDeleted = Boolean(msg.deleted);
          const isEdited = Boolean(msg.editedAt);
          const displayContent = isDeleted ? "Tin nhắn đã bị xóa" : msg.content;

          return (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                mine ? "ml-auto bg-primary-700 text-white" : "border border-cyan-100 bg-white text-slate-700"
              }`}
            >
              <p className="text-[11px] opacity-70">{msg.senderName}</p>
              <p className={isDeleted ? "italic opacity-70" : ""}>
                {displayContent}
                {isEdited && !isDeleted && <span className="ml-1 text-[11px] opacity-70">(đã sửa)</span>}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 border-t border-cyan-100 p-3">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          placeholder="Nhập tin nhắn..."
          disabled={status === "connecting"}
        />
        <button type="button" onClick={sendMessage} className="btn-primary inline-flex items-center gap-2 px-4 text-sm" disabled={status === "connecting"}>
          <Send size={16} aria-hidden="true" />
          Gửi
        </button>
      </div>
    </div>
  );
}
