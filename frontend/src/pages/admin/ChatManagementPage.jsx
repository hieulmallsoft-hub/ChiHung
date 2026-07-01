import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Pencil, Send, Trash2, X } from "lucide-react";
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

export default function ChatManagementPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const stompRef = useRef(null);
  const adminSubscriptionRef = useRef(null);
  const roomSubscriptionRef = useRef(null);
  const roomPollingRef = useRef(null);
  const messagePollingRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const filteredRooms = useMemo(() => {
    if (!search.trim()) return rooms;
    const keyword = search.trim().toLowerCase();
    return rooms.filter((room) => room.userName?.toLowerCase().includes(keyword));
  }, [rooms, search]);

  const loadRooms = useCallback(async ({ silent = false } = {}) => {
    try {
      const response = await adminApi.getChatRooms({ page: 0, size: 30 });
      const nextRooms = response.data?.data?.content || [];
      setRooms(nextRooms);
      setSelectedRoomId((current) => {
        if (current && nextRooms.some((room) => room.id === current)) {
          return current;
        }
        return nextRooms[0]?.id ?? null;
      });
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || "Không tải được danh sách phòng chat");
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
      setMessages(response.data?.data?.content || []);
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || "Không tải được tin nhắn");
      }
    }
  }, []);

  const subscribeRoom = useCallback(
    (roomId) => {
      if (roomSubscriptionRef.current) {
        roomSubscriptionRef.current.unsubscribe();
        roomSubscriptionRef.current = null;
      }

      if (!roomId || !stompRef.current?.connected) {
        return;
      }

      roomSubscriptionRef.current = stompRef.current.subscribe(`/topic/chat/${roomId}`, (frame) => {
        const payload = JSON.parse(frame.body);
        setMessages((previous) => mergeMessageList(previous, payload));
        loadRooms({ silent: true });
      });
    },
    [loadRooms]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    let active = true;
    loadRooms();
    setStatus("connecting");

    const client = createChatStompClient({
      onConnect: () => {
        if (!active) return;

        setStatus("connected");
        adminSubscriptionRef.current = client.subscribe("/topic/admin/chats", () => {
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

    roomPollingRef.current = setInterval(() => {
      loadRooms({ silent: true });
    }, 5000);

    return () => {
      active = false;
      if (adminSubscriptionRef.current) {
        adminSubscriptionRef.current.unsubscribe();
        adminSubscriptionRef.current = null;
      }
      if (roomSubscriptionRef.current) {
        roomSubscriptionRef.current.unsubscribe();
        roomSubscriptionRef.current = null;
      }
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
      if (roomPollingRef.current) {
        clearInterval(roomPollingRef.current);
        roomPollingRef.current = null;
      }
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
        messagePollingRef.current = null;
      }
    };
  }, [loadRooms]);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      subscribeRoom(null);
      return;
    }

    loadMessages(selectedRoomId);
    chatApi
      .markRead(selectedRoomId)
      .then(() => loadRooms({ silent: true }))
      .catch(() => undefined);

    if (status === "connected") {
      subscribeRoom(selectedRoomId);
    }
  }, [selectedRoomId, status, loadMessages, loadRooms, subscribeRoom]);

  useEffect(() => {
    if (messagePollingRef.current) {
      clearInterval(messagePollingRef.current);
      messagePollingRef.current = null;
    }

    if (!selectedRoomId || status === "connected") {
      return;
    }

    messagePollingRef.current = setInterval(() => {
      loadMessages(selectedRoomId, { silent: true });
    }, 3000);

    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
        messagePollingRef.current = null;
      }
    };
  }, [selectedRoomId, status, loadMessages]);

  const startEdit = (message) => {
    if (!message || message.deleted || message.senderId !== user?.id) return;
    setEditingId(message.id);
    setEditingContent(message.content || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingContent.trim()) return;

    try {
      await adminApi.editChatMessage(editingId, { content: editingContent.trim() });
      cancelEdit();
      if (selectedRoomId) {
        await loadMessages(selectedRoomId, { silent: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể sửa tin nhắn");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!messageId) return;
    if (!window.confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;

    try {
      await adminApi.deleteChatMessage(messageId);
      if (selectedRoomId) {
        await loadMessages(selectedRoomId, { silent: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa tin nhắn");
    }
  };

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
        const response = await chatApi.sendMessage({ roomId: selectedRoomId, content: messageContent });
        const sentMessage = response?.data?.data;
        if (sentMessage) {
          setMessages((previous) => mergeMessageList(previous, sentMessage));
        }
      }

      setContent("");
      await loadRooms({ silent: true });
      await chatApi.markRead(selectedRoomId).catch(() => undefined);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  };

  const resolve = async (roomId) => {
    try {
      await adminApi.resolveRoom(roomId);
      toast.success("Đã đánh dấu cuộc trò chuyện đã xử lý");
      await loadRooms();
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
        setMessages([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái phòng");
    }
  };

  const formatTime = (value) => {
    if (!value) return "--";
    try {
      return new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "--";
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <aside className="admin-card h-[680px] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="font-heading text-xl font-bold text-white">Hỗ trợ trực tuyến</h1>
            <p className="text-xs text-slate-300">Quản lý tất cả cuộc trò chuyện với khách hàng</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              status === "connected" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "connected" ? "Real-time" : "Dự phòng"}
          </span>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm khách hàng..."
          className="admin-input mb-3"
        />

        <div className="space-y-3 text-sm">
          {filteredRooms.map((room) => (
            <button
              type="button"
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selectedRoomId === room.id ? "border-primary-300 bg-cyan-50 shadow-soft" : "border-cyan-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{room.userName}</p>
                {(room.unreadAdminCount || 0) > 0 && (
                  <span className="rounded-full bg-primary-700 px-2 py-0.5 text-[10px] font-bold text-white">
                    {room.unreadAdminCount}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">Trạng thái: {chatRoomStatusLabels[room.status] || room.status}</p>
              <p className="text-xs text-slate-400">Cập nhật: {formatTime(room.lastMessageAt)}</p>
            </button>
          ))}
          {filteredRooms.length === 0 && (
            <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50 p-4 text-xs text-slate-500">
              Không tìm thấy phòng phù hợp.
            </div>
          )}
        </div>
      </aside>

      <section className="admin-card flex h-[680px] flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-semibold text-white">
              {selectedRoom ? `Khách hàng: ${selectedRoom.userName}` : "Chọn phòng để bắt đầu"}
            </h2>
            <p className="text-xs text-slate-300">
              {selectedRoom
                ? `Trạng thái: ${chatRoomStatusLabels[selectedRoom.status] || selectedRoom.status}`
                : "Chọn một cuộc trò chuyện để xem chi tiết."}
            </p>
          </div>
          {selectedRoom && (
            <button type="button" className="btn-secondary inline-flex items-center gap-2 text-xs" onClick={() => resolve(selectedRoom.id)}>
              <CheckCircle2 size={15} aria-hidden="true" />
              Đã xử lý
            </button>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-400">Chưa có tin nhắn nào trong phòng này.</p>
          )}
          {messages.map((msg) => {
            const mine = msg.senderId === user?.id;
            const isDeleted = Boolean(msg.deleted);
            const isEdited = Boolean(msg.editedAt);
            const displayContent = isDeleted ? "Tin nhắn đã bị xóa" : msg.content;
            const isEditing = editingId === msg.id;

            return (
              <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    mine ? "bg-primary-700 text-white" : "border border-cyan-100 bg-white text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold opacity-70">{msg.senderName}</p>
                    <span className="text-[10px] opacity-60">{formatTime(msg.createdAt)}</span>
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(event) => setEditingContent(event.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 outline-none"
                      />
                      <div className="flex gap-2">
                        <button type="button" className="btn-primary inline-flex items-center gap-1 text-xs" onClick={saveEdit}>
                          <CheckCircle2 size={14} aria-hidden="true" />
                          Lưu
                        </button>
                        <button type="button" className="btn-secondary inline-flex items-center gap-1 text-xs" onClick={cancelEdit}>
                          <X size={14} aria-hidden="true" />
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={isDeleted ? "mt-1 italic opacity-70" : "mt-1"}>
                      {displayContent}
                      {isEdited && !isDeleted && <span className="ml-1 text-[10px] opacity-70">(đã sửa)</span>}
                    </p>
                  )}

                  {!isEditing && (
                    <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold opacity-80">
                      {mine && !isDeleted && (
                        <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => startEdit(msg)}>
                          <Pencil size={13} aria-hidden="true" />
                          Sửa
                        </button>
                      )}
                      <button type="button" className="inline-flex items-center gap-1 hover:underline" onClick={() => deleteMessage(msg.id)}>
                        <Trash2 size={13} aria-hidden="true" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="admin-input min-w-0 flex-1"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && sendMessage()}
            placeholder="Nhập phản hồi..."
            disabled={!selectedRoomId}
          />
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={sendMessage} disabled={!selectedRoomId}>
            <Send size={16} aria-hidden="true" />
            Gửi
          </button>
        </div>
      </section>
    </div>
  );
}
