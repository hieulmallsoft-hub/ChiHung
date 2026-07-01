import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { chatApi } from "../../api/chatApi";
import { createChatStompClient, mergeMessageList } from "../../utils/chatSocket";
import { useAuth } from "../../hooks/useAuth";

export default function ChatSupportPage() {
  const { user, hasRole } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const stompRef = useRef(null);
  const pollingRef = useRef(null);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(
    async (roomId, { detectNewAdminMessages = false } = {}) => {
      const messageRes = await chatApi.getMessages(roomId, { page: 0, size: 50 });
      const nextMessages = messageRes.data?.data?.content || [];

      if (detectNewAdminMessages) {
        setMessages((previous) => {
          const previousIds = new Set(previous.map((item) => item.id));
          const newAdminMessages = nextMessages.filter(
            (item) => !previousIds.has(item.id) && item.senderId !== user?.id
          );

          if (newAdminMessages.length > 0) {
            toast.success("Quản trị viên vừa phản hồi tin nhắn của bạn");
          }

          return nextMessages;
        });
        return;
      }

      setMessages(nextMessages);
    },
    [user?.id]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!user?.email || hasRole("ROLE_ADMIN")) return;

    let active = true;

    const setup = async () => {
      try {
        setStatus("connecting");
        const roomRes = await chatApi.openRoom();
        const currentRoom = roomRes.data.data;
        if (!active) return;

        setRoom(currentRoom);
        await loadMessages(currentRoom.id);
        await chatApi.markRead(currentRoom.id).catch(() => undefined);

        const client = createChatStompClient({
          onConnect: () => {
            if (!active) return;

            setStatus("connected");
            client.subscribe(`/topic/chat/${currentRoom.id}`, (frame) => {
              const incoming = JSON.parse(frame.body);
              setMessages((previous) => {
                const next = mergeMessageList(previous, incoming);
                const isNew = next.length > previous.length;
                if (isNew && incoming?.senderId !== user?.id) {
                  toast.success("Quản trị viên vừa phản hồi tin nhắn của bạn");
                }
                return next;
              });
            });
          },
          onStompError: () => {
            if (active) setStatus("fallback");
          },
          onWebSocketClose: () => {
            if (active) setStatus("fallback");
          },
          onWebSocketError: () => {
            if (active) setStatus("fallback");
          },
        });

        client.activate();
        stompRef.current = client;
      } catch (error) {
        if (!active) return;

        setStatus("fallback");
        toast.error(error?.response?.data?.message || "Không tải được hỗ trợ chat");
      }
    };

    setup();

    return () => {
      active = false;
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [user?.email, user?.id, hasRole, loadMessages]);

  useEffect(() => {
    if (!room?.id) return;

    if (status === "connected") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      return;
    }

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      loadMessages(room.id, { detectNewAdminMessages: true }).catch(() => undefined);
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [room?.id, status, loadMessages]);

  const sendMessage = async () => {
    if (!room || !content.trim()) return;

    const messageContent = content.trim();
    try {
      const canUseSocket = status === "connected" && stompRef.current?.connected && !!user?.email;
      if (canUseSocket) {
        stompRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify({
            roomId: room.id,
            content: messageContent,
          }),
        });
      } else {
        const response = await chatApi.sendMessage({ roomId: room.id, content: messageContent });
        const sentMessage = response?.data?.data;
        if (sentMessage) {
          setMessages((previous) => mergeMessageList(previous, sentMessage));
        }
      }

      setContent("");
    } catch {
      toast.error("Gửi tin nhắn thất bại");
    }
  };

  if (hasRole("ROLE_ADMIN")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="section-shell">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">Hỗ trợ khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Nhân viên tư vấn sẽ phản hồi trực tiếp trong cuộc trò chuyện này.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            status === "connected" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {status === "connected" ? "Đang kết nối real-time" : "Đang dùng dự phòng"}
        </span>
      </div>

      <div className="mt-4 h-[420px] space-y-2 overflow-y-auto rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50 to-white p-3">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-cyan-200 bg-white/80 p-3 text-xs text-slate-500">
            Chưa có tin nhắn. Bạn có thể hỏi về size, tồn kho, đơn hàng hoặc thanh toán.
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
              className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
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

      <div className="mt-4 flex gap-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          className="min-w-0 flex-1"
          placeholder="Nhập nội dung cần hỗ trợ..."
        />
        <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={sendMessage}>
          <Send size={16} aria-hidden="true" />
          Gửi
        </button>
      </div>
    </div>
  );
}
