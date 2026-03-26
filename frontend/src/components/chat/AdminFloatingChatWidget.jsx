import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { chatApi } from "../../api/chatApi";
import { createChatStompClient, mergeMessageList } from "../../utils/chatSocket";
import { useAuth } from "../../hooks/useAuth";

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
  const roomSubRef = useRef(null);
  const roomsPollingRef = useRef(null);
  const messagesPollingRef = useRef(null);
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
          toast.success("Co tin nhan moi tu user");
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
        toast.error(error?.response?.data?.message || "Khong tai duoc danh sach chat");
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
        toast.error(error?.response?.data?.message || "Khong tai duoc tin nhan");
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
            toast.success("Co tin nhan moi tu khach hang");
          }

          return next;
        });

        loadRooms({ silent: true });
      });
    },
    [loadRooms, user?.id]
  );

  useEffect(() => {
    if (!user?.email) return;

    let active = true;
    setStatus("connecting");
    loadRooms({ silent: true });

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

    roomsPollingRef.current = setInterval(() => {
      loadRooms({ silent: true });
    }, 5000);

    return () => {
      active = false;
      if (roomSubRef.current) {
        roomSubRef.current.unsubscribe();
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
      toast.error(error?.response?.data?.message || "Gui tin nhan that bai");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-700 to-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[11px]">A</span>
        Chat Admin
        {totalUnread > 0 && (
          <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-primary-700">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[440px] overflow-hidden rounded-3xl border border-rose-100 bg-white/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 text-white">
        <p className="font-semibold">Chat ho tro khach hang</p>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              status === "connected" ? "bg-emerald-200 text-emerald-700" : "bg-amber-200 text-amber-700"
            }`}
          >
            {status === "connected" ? "Realtime" : "Fallback"}
          </span>
          <button onClick={() => setOpen(false)} className="text-sm">
            Dong
          </button>
        </div>
      </div>

      <div className="grid h-[420px] grid-cols-[150px,1fr]">
        <aside className="border-r border-rose-100 bg-gradient-to-b from-rose-50 to-white p-2">
          <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Rooms</div>
          <div className="space-y-1 overflow-y-auto">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`w-full rounded-lg px-2 py-2 text-left text-xs transition ${
                  selectedRoomId === room.id ? "bg-primary-700 text-white" : "bg-white text-slate-700 hover:bg-rose-100"
                }`}
              >
                <p className="truncate font-semibold">{room.userName}</p>
                <p className={`${selectedRoomId === room.id ? "text-rose-100" : "text-slate-500"}`}>{room.status}</p>
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

        <section className="flex flex-col">
          <div className="border-b border-rose-100 px-3 py-2 text-sm font-semibold text-slate-700">
            {selectedRoom ? `Khach: ${selectedRoom.userName}` : "Chon room de chat"}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-rose-50 to-white p-3">
            {messages.length === 0 && <p className="text-xs text-slate-500">Chua co tin nhan.</p>}
            {messages.map((msg) => {
              const mine = msg.senderId === user?.id;
              const isDeleted = Boolean(msg.deleted);
              const isEdited = Boolean(msg.editedAt);
              const displayContent = isDeleted ? "Tin nhan da bi xoa" : msg.content;
              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-sm ${
                    mine ? "ml-auto bg-primary-700 text-white" : "border border-rose-100 bg-white text-slate-700"
                  }`}
                >
                  <p className="text-[10px] opacity-70">{msg.senderName}</p>
                  <p className={isDeleted ? "italic opacity-70" : ""}>
                    {displayContent}
                    {isEdited && !isDeleted && <span className="ml-1 text-[10px] opacity-70">(da sua)</span>}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 border-t border-rose-100 p-3">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              placeholder="Nhap phan hoi..."
              disabled={!selectedRoomId}
            />
            <button className="btn-primary text-sm" onClick={sendMessage} disabled={!selectedRoomId}>
              Gui
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
