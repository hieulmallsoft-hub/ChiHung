import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { chatApi } from "../../api/chatApi";
import { createChatStompClient, mergeMessageList } from "../../utils/chatSocket";
import { useAuth } from "../../hooks/useAuth";

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
  const roomSubscriptionRef = useRef(null);
  const roomPollingRef = useRef(null);
  const messagePollingRef = useRef(null);

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
        toast.error(error?.response?.data?.message || "Khong tai duoc danh sach chat room");
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
        toast.error(error?.response?.data?.message || "Khong tai duoc tin nhan");
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
        setMessages((prev) => mergeMessageList(prev, payload));
        loadRooms({ silent: true });
      });
    },
    [loadRooms]
  );

  useEffect(() => {
    let active = true;
    loadRooms();
    setStatus("connecting");

    const client = createChatStompClient({
      onConnect: () => {
        if (!active) return;
        setStatus("connected");
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
      if (roomSubscriptionRef.current) {
        roomSubscriptionRef.current.unsubscribe();
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
    chatApi.markRead(selectedRoomId).catch(() => undefined);

    if (status === "connected") {
      subscribeRoom(selectedRoomId);
    }
  }, [selectedRoomId, status, loadMessages, subscribeRoom]);

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

  const selectRoom = async (roomId) => {
    setSelectedRoomId(roomId);
  };

  const startEdit = (message) => {
    if (!message || message.deleted) return;
    if (message.senderId !== user?.id) return;
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
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the sua tin nhan");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!messageId) return;
    if (!window.confirm("Ban co chac muon xoa tin nhan nay?")) return;
    try {
      await adminApi.deleteChatMessage(messageId);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the xoa tin nhan");
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
          setMessages((prev) => mergeMessageList(prev, sentMessage));
        }
      }
      setContent("");
      await loadRooms({ silent: true });
      await chatApi.markRead(selectedRoomId).catch(() => undefined);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gui tin nhan that bai");
    }
  };

  const resolve = async (roomId) => {
    try {
      await adminApi.resolveRoom(roomId);
      toast.success("Da danh dau cuoc tro chuyen da xu ly");
      await loadRooms();
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
        setMessages([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Khong the cap nhat trang thai room");
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
            <h1 className="font-heading text-xl font-bold text-white">Ho tro truc tuyen</h1>
            <p className="text-xs text-slate-300">Quan ly tat ca cuoc tro chuyen</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              status === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "connected" ? "Realtime" : "Fallback"}
          </span>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tim khach hang..."
          className="admin-input mb-3"
        />

        <div className="space-y-3 text-sm">
          {filteredRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => selectRoom(room.id)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selectedRoomId === room.id ? "border-primary-300 bg-rose-50 shadow-soft" : "border-rose-100 bg-white"
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
              <p className="mt-1 text-xs text-slate-500">Trang thai: {room.status}</p>
              <p className="text-xs text-slate-400">Cap nhat: {formatTime(room.lastMessageAt)}</p>
            </button>
          ))}
          {filteredRooms.length === 0 && (
            <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-4 text-xs text-slate-500">
              Khong tim thay room phu hop.
            </div>
          )}
        </div>
      </aside>

      <section className="admin-card flex h-[680px] flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
          <h2 className="font-heading text-xl font-semibold text-white">
            {selectedRoom ? `Khach hang: ${selectedRoom.userName}` : "Chon room de bat dau"}
          </h2>
          <p className="text-xs text-slate-300">
            {selectedRoom ? `Trang thai: ${selectedRoom.status}` : "Chon mot cuoc tro chuyen de xem chi tiet."}
          </p>
        </div>
          {selectedRoom && (
            <button className="btn-secondary text-xs" onClick={() => resolve(selectedRoom.id)}>
              Danh dau da xu ly
            </button>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">Chua co tin nhan nao trong room nay.</p>
          )}
          {messages.map((msg) => {
            const mine = msg.senderId === user?.id;
            const isDeleted = Boolean(msg.deleted);
            const isEdited = Boolean(msg.editedAt);
            const displayContent = isDeleted ? "Tin nhan da bi xoa" : msg.content;
            const isEditing = editingId === msg.id;

            return (
              <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    mine ? "bg-primary-700 text-white" : "border border-rose-100 bg-white text-slate-700"
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
                        className="w-full text-slate-700"
                      />
                      <div className="flex gap-2">
                        <button className="btn-primary text-xs" onClick={saveEdit}>
                          Luu
                        </button>
                        <button className="btn-secondary text-xs" onClick={cancelEdit}>
                          Huy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={isDeleted ? "mt-1 italic opacity-70" : "mt-1"}>
                      {displayContent}
                      {isEdited && !isDeleted && <span className="ml-1 text-[10px] opacity-70">(da sua)</span>}
                    </p>
                  )}

                  {!isEditing && (
                    <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold opacity-80">
                      {mine && !isDeleted && (
                        <button className="hover:underline" onClick={() => startEdit(msg)}>
                          Sua
                        </button>
                      )}
                      <button className="hover:underline" onClick={() => deleteMessage(msg.id)}>
                        Xoa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="admin-input flex-1"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(event) => event.key === "Enter" && sendMessage()}
            placeholder="Nhap phan hoi..."
            disabled={!selectedRoomId}
          />
          <button className="btn-primary" onClick={sendMessage} disabled={!selectedRoomId}>
            Gui
          </button>
        </div>
      </section>
    </div>
  );
}
