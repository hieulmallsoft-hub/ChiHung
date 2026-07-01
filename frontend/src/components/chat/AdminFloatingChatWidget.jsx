import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { chatApi } from "../../api/chatApi";
import { createChatStompClient, mergeMessageList } from "../../utils/chatSocket";
import { useAuth } from "../../hooks/useAuth";

const chatRoomStatusLabels = {
  OPEN: "Đang mở",
  RESOLVED: "Đã xử lý",
  CLOSED: "Đã đóng",
};

export default function AdminFloatingChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [totalUnread, setTotalUnread] = useState(0);

  const stompRef = useRef(null);
  const adminSubRef = useRef(null);
  const roomSubRef = useRef(null);
  const roomsPollingRef = useRef(null);
  const messagesPollingRef = useRef(null);
  const messagesEndRef = useRef(null);
  const openRef = useRef(false);
  const unreadInitializedRef = useRef(false);
  const previousUnreadRef = useRef(0);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const loadRooms = useCallback(async ({ silent = false } = {}) => {
    try {
      const response = await adminApi.getChatRooms({ page: 0, size: 30 });
      const nextRooms = response?.data?.data?.content || [];
      const unreadTotal = nextRooms.reduce((sum, room) => sum + (room.unreadAdminCount || 0), 0);

      if (unreadInitializedRef.current) {
        if (unreadTotal > previousUnreadRef.current && !openRef.current) {
          toast.success("Có tin nhắn mới từ khách hàng");
        }
      } else {
        unreadInitializedRef.current = true;
      }

      previousUnreadRef.current = unreadTotal;
      setRooms(nextRooms);
      setTotalUnread(unreadTotal);
      setSelectedRoomId((current) => {
        if (current && nextRooms.some((room) => room.id === current)) {
          return current;
        }
        return nextRooms[0]?.id ?? null;
      });
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || "Không tải được danh sách chat");
      }
    }
  }, []);

  const loadMessages = useCallback(async (roomId, { silent = false } = {}) => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    try {
      const response = await chatApi.getMessages(roomId, { page: 0, size: 50 });
      setMessages(response?.data?.data?.content || []);
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || "Không tải được tin nhắn");
      }
    }
  }, []);

  const subscribeRoom = useCallback(
    (roomId) => {
      if (roomSubRef.current) {
        roomSubRef.current.unsubscribe();
        roomSubRef.current = null;
      }

      if (!roomId || !stompRef.current?.connected) {
        return;
      }

      roomSubRef.current = stompRef.current.subscribe(`/topic/chat/${roomId}`, (frame) => {
        const payload = JSON.parse(frame.body);

        setMessages((previous) => {
          const next = mergeMessageList(previous, payload);
          const isNew = next.length > previous.length;
          const isFromUser = payload?.senderId && payload.senderId !== user?.id;

          if (isNew && isFromUser && !openRef.current) {
            toast.success("Có tin nhắn mới từ khách hàng");
          }

          return next;
        });

        loadRooms({ silent: true });
      });
    },
    [loadRooms, user?.id]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (!user?.email) return;

    let active = true;
    setStatus("connecting");
    loadRooms({ silent: true });

    const client = createChatStompClient({
      onConnect: () => {
        if (!active) return;

        setStatus("connected");
        adminSubRef.current = client.subscribe("/topic/admin/chats", () => {
          loadRooms({ silent: true });
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

    roomsPollingRef.current = setInterval(() => {
      loadRooms({ silent: true });
    }, 5000);

    return () => {
      active = false;
      if (adminSubRef.current) {
        adminSubRef.current.unsubscribe();
        adminSubRef.current = null;
      }
      if (roomSubRef.current) {
        roomSubRef.current.unsubscribe();
        roomSubRef.current = null;
      }
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
      if (roomsPollingRef.current) {
        clearInterval(roomsPollingRef.current);
        roomsPollingRef.current = null;
      }
      if (messagesPollingRef.current) {
        clearInterval(messagesPollingRef.current);
        messagesPollingRef.current = null;
      }
    };
  }, [user?.email, loadRooms]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open || !selectedRoomId) {
      return;
    }

    loadMessages(selectedRoomId, { silent: true });
    chatApi
      .markRead(selectedRoomId)
      .then(() => loadRooms({ silent: true }))
      .catch(() => undefined);
  }, [open, selectedRoomId, loadMessages, loadRooms]);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      subscribeRoom(null);
      return;
    }

    if (status === "connected") {
      subscribeRoom(selectedRoomId);
      return;
    }

    subscribeRoom(null);
  }, [selectedRoomId, status, subscribeRoom]);

  useEffect(() => {
    if (messagesPollingRef.current) {
      clearInterval(messagesPollingRef.current);
      messagesPollingRef.current = null;
    }

    if (!open || !selectedRoomId || status === "connected") {
      return;
    }

    messagesPollingRef.current = setInterval(() => {
      loadMessages(selectedRoomId, { silent: true });
    }, 3000);

    return () => {
      if (messagesPollingRef.current) {
        clearInterval(messagesPollingRef.current);
        messagesPollingRef.current = null;
      }
    };
  }, [open, selectedRoomId, status, loadMessages]);

  const sendMessage = async () => {
    if (!selectedRoomId || !content.trim()) return;

    const messageContent = content.trim();
    try {
      const canUseSocket = status === "connected" && stompRef.current?.connected && !!user?.email;
      if (canUseSocket) {
        stompRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify({
            roomId: selectedRoomId,
            content: messageContent,
          }),
        });
      } else {
        const response = await chatApi.sendMessage({
          roomId: selectedRoomId,
          content: messageContent,
        });
        const sentMessage = response?.data?.data;
        if (sentMessage) {
          setMessages((previous) => mergeMessageList(previous, sentMessage));
        }
      }

      setContent("");
      await chatApi.markRead(selectedRoomId).catch(() => undefined);
      await loadRooms({ silent: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-700 to-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
      >
        <MessageCircle size={18} aria-hidden="true" />
        Chat quản trị
        {totalUnread > 0 && (
          <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-primary-700">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 w-[calc(100vw-2rem)] max-w-[520px] overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-2xl md:right-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 text-white">
        <div>
          <p className="font-semibold">Hỗ trợ khách hàng</p>
          <p className="text-[11px] text-cyan-50">Trao đổi trực tiếp với người dùng</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              status === "connected" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "connected" ? "Real-time" : "Dự phòng"}
          </span>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 transition hover:bg-white/15" aria-label="Đóng chat">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid h-[420px] grid-cols-[150px,1fr]">
        <aside className="border-r border-cyan-100 bg-gradient-to-b from-cyan-50 to-white p-2">
          <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Phòng chat</div>
          <div className="space-y-1 overflow-y-auto">
            {rooms.length === 0 && (
              <div className="rounded-xl border border-dashed border-cyan-200 bg-white/80 p-3 text-xs text-slate-500">
                Chưa có cuộc trò chuyện.
              </div>
            )}
            {rooms.map((room) => (
              <button
                type="button"
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`w-full rounded-lg px-2 py-2 text-left text-xs transition ${
                  selectedRoomId === room.id ? "bg-primary-700 text-white" : "bg-white text-slate-700 hover:bg-cyan-100"
                }`}
              >
                <p className="truncate font-semibold">{room.userName}</p>
                <p className={`${selectedRoomId === room.id ? "text-cyan-100" : "text-slate-500"}`}>
                  {chatRoomStatusLabels[room.status] || room.status}
                </p>
                {(room.unreadAdminCount || 0) > 0 && (
                  <span
                    className={`mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      selectedRoomId === room.id ? "bg-white text-primary-700" : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {room.unreadAdminCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <div className="border-b border-cyan-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {selectedRoom ? `Khách hàng: ${selectedRoom.userName}` : "Chọn phòng để chat"}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-cyan-50 to-white p-3">
            {messages.length === 0 && <p className="text-xs text-slate-500">Chưa có tin nhắn.</p>}
            {messages.map((msg) => {
              const mine = msg.senderId === user?.id;
              const isDeleted = Boolean(msg.deleted);
              const isEdited = Boolean(msg.editedAt);
              const displayContent = isDeleted ? "Tin nhắn đã bị xóa" : msg.content;

              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-sm ${
                    mine ? "ml-auto bg-primary-700 text-white" : "border border-cyan-100 bg-white text-slate-700"
                  }`}
                >
                  <p className="text-[10px] opacity-70">{msg.senderName}</p>
                  <p className={isDeleted ? "italic opacity-70" : ""}>
                    {displayContent}
                    {isEdited && !isDeleted && <span className="ml-1 text-[10px] opacity-70">(đã sửa)</span>}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-cyan-100 p-3">
            <input
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              placeholder="Nhập phản hồi..."
              disabled={!selectedRoomId}
            />
            <button type="button" className="btn-primary inline-flex items-center gap-2 text-sm" onClick={sendMessage} disabled={!selectedRoomId}>
              <Send size={16} aria-hidden="true" />
              Gửi
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
