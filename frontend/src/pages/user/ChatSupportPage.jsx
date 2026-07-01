import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
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

  const loadMessages = async (roomId, { detectNewAdminMessages = false } = {}) => {
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
  };

  useEffect(() => {
    const setup = async () => {
      try {
        setStatus("connecting");
        const roomRes = await chatApi.openRoom();
        const currentRoom = roomRes.data.data;
        setRoom(currentRoom);

        await loadMessages(currentRoom.id);
        await chatApi.markRead(currentRoom.id).catch(() => undefined);

        const client = createChatStompClient({
          onConnect: () => {
            setStatus("connected");
            client.subscribe(`/topic/chat/${currentRoom.id}`, (frame) => {
              const incoming = JSON.parse(frame.body);
              setMessages((prev) => {
                const next = mergeMessageList(prev, incoming);
                const isNew = next.length > prev.length;
                if (isNew && incoming?.senderId !== user?.id) {
                  toast.success("Quản trị viên vừa phản hồi tin nhắn của bạn");
                }
                return next;
              });
            });
          },
          onStompError: () => {
            setStatus("fallback");
          },
          onWebSocketClose: () => {
            setStatus("fallback");
          },
          onWebSocketError: (event) => {
            console.error("WebSocket error", event);
            setStatus("fallback");
          },
        });
        client.activate();
        stompRef.current = client;
      } catch (error) {
        setStatus("fallback");
        toast.error(error?.response?.data?.message || "Không tải được hỗ trợ chat");
      }
    };

    setup();

    return () => {
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

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
  }, [room?.id, status]);

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
          setMessages((prev) => mergeMessageList(prev, sentMessage));
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
        <h1 className="font-heading text-2xl font-bold text-slate-900">Hỗ trợ khách hàng</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status === "connected" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
          {status === "connected" ? "Đang kết nối thời gian thực" : "Đang dùng polling dự phòng"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">Nhân viên tư vấn sẽ phản hồi trong thời gian thực.</p>

      <div className="mt-4 h-[420px] space-y-2 overflow-y-auto rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50 to-white p-3">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-cyan-200 bg-white/70 p-3 text-xs text-slate-500">
            Chưa có tin nhắn. Bạn có thể đặt câu hỏi về size, tồn kho hoặc thanh toán.
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
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          className="flex-1"
          placeholder="Nhập nội dung cần hỗ trợ..."
        />
        <button className="btn-primary" onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
}
