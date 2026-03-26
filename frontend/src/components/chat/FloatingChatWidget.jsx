import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { chatApi } from "../../api/chatApi";
import { createChatStompClient, mergeMessageList } from "../../utils/chatSocket";
import { useAuth } from "../../hooks/useAuth";

export default function FloatingChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("idle");
  const [unreadCount, setUnreadCount] = useState(0);
  const stompRef = useRef(null);
  const pollingRef = useRef(null);
  const openRef = useRef(false);

  const loadMessages = async (targetRoomId, { silent = false, detectNewAdminMessages = false } = {}) => {
    try {
      const messageResponse = await chatApi.getMessages(targetRoomId, { page: 0, size: 50 });
      const nextMessages = messageResponse.data?.data?.content || [];

      if (detectNewAdminMessages && !openRef.current) {
        setMessages((previous) => {
          const previousIds = new Set(previous.map((item) => item.id));
          const newAdminMessages = nextMessages.filter(
            (item) => !previousIds.has(item.id) && item.senderId !== user?.id
          );

          if (newAdminMessages.length > 0) {
            setUnreadCount((count) => count + newAdminMessages.length);
            toast.success("Ban co tin nhan moi tu admin");
          }

          return nextMessages;
        });
        return;
      }

      setMessages(nextMessages);
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || "Khong tai duoc lich su chat");
      }
    }
  };

  useEffect(() => {
    openRef.current = open;
    if (!open || !roomId) {
      return;
    }
    setUnreadCount(0);
    chatApi.markRead(roomId).catch(() => undefined);
  }, [open, roomId]);

  useEffect(() => {
    if (!user?.email) return;

    let active = true;
    setStatus("connecting");

    const bootstrapConnection = async () => {
      try {
        const roomResponse = await chatApi.openRoom();
        const targetRoomId = roomResponse.data?.data?.id;
        if (!active || !targetRoomId) return;
        setRoomId(targetRoomId);
        await loadMessages(targetRoomId, { silent: true });

        const client = createChatStompClient({
          onConnect: () => {
            if (!active) return;
            setStatus("connected");
            client.subscribe(`/topic/chat/${targetRoomId}`, (frame) => {
              const payload = JSON.parse(frame.body);
              setMessages((previous) => {
                const next = mergeMessageList(previous, payload);
                const isNew = next.length > previous.length;
                const isFromAdmin = payload?.senderId && payload.senderId !== user?.id;
                if (isNew && isFromAdmin && !openRef.current) {
                  setUnreadCount((count) => count + 1);
                  toast.success("Ban co tin nhan moi tu admin");
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
        toast.error(error?.response?.data?.message || "Khong the ket noi chat");
      }
    };

    bootstrapConnection();

    return () => {
      active = false;
      if (stompRef.current?.active) {
        stompRef.current.deactivate();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [user?.email]);

  useEffect(() => {
    if (!roomId) return;
    if (status === "connected") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
      return;
    }

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      loadMessages(roomId, { silent: true, detectNewAdminMessages: true }).catch(() => undefined);
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [roomId, status, user?.id]);

  const sendMessage = async () => {
    if (!content.trim() || !roomId) return;

    const messageContent = content.trim();
    try {
      const canUseSocket = status === "connected" && stompRef.current?.connected && !!user?.email;
      if (canUseSocket) {
        stompRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify({
            roomId,
            content: messageContent,
          }),
        });
      } else {
        const response = await chatApi.sendMessage({ roomId, content: messageContent });
        const sentMessage = response?.data?.data;
        if (sentMessage) {
          setMessages((prev) => mergeMessageList(prev, sentMessage));
        }
      }
      setContent("");
    } catch {
      toast.error("Gui tin nhan that bai");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[11px]">...</span>
        Chat ho tro
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-primary-700">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] overflow-hidden rounded-3xl border border-rose-100 bg-white/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 text-white">
        <p className="font-semibold">Ho tro truc tuyen</p>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status === "connected" ? "bg-emerald-200 text-emerald-700" : "bg-amber-200 text-amber-700"}`}>
            {status === "connected" ? "Realtime" : "Fallback"}
          </span>
          <button onClick={() => setOpen(false)} className="text-sm">
            Dong
          </button>
        </div>
      </div>

      <div className="h-80 space-y-2 overflow-y-auto bg-gradient-to-b from-rose-50 to-white p-3">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-rose-200 bg-white/70 p-3 text-xs text-slate-500">
            Chao ban, hay gui noi dung de admin ho tro ngay.
          </div>
        )}
        {messages.map((msg) => {
          const mine = msg.senderId === user?.id;
          const isDeleted = Boolean(msg.deleted);
          const isEdited = Boolean(msg.editedAt);
          const displayContent = isDeleted ? "Tin nhan da bi xoa" : msg.content;
          return (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                mine ? "ml-auto bg-primary-700 text-white" : "border border-rose-100 bg-white text-slate-700"
              }`}
            >
              <p className="text-[11px] opacity-70">{msg.senderName}</p>
              <p className={isDeleted ? "italic opacity-70" : ""}>
                {displayContent}
                {isEdited && !isDeleted && <span className="ml-1 text-[11px] opacity-70">(da sua)</span>}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 border-t border-rose-100 p-3">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Nhap tin nhan..."
        />
        <button onClick={sendMessage} className="btn-primary px-4 text-sm">
          Gui
        </button>
      </div>
    </div>
  );
}
