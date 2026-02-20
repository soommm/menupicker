/**
 * 투표 방 화면 - 실시간 투표 (Socket.io)
 */
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import './Room.css';

const MENU_EMOJI_MAP = {
  '한식': '🍚', '중식': '🥟', '일식': '🍣', '양식': '🍝', '분식': '🍢',
  '치킨': '🍗', '면요리': '🍜', '김치찌개': '🥘', '제육볶음': '🥢', '기타': '🍽️'
};
function getMenuEmoji(name) {
  return MENU_EMOJI_MAP[name] || '🍽️';
}

export default function Room({ roomId, userName, initialRoom, onShowResult, onLeave }) {
  const [room, setRoom] = useState(initialRoom || null);
  const [socket, setSocket] = useState(null);
  const [myVote, setMyVote] = useState(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { path: '/socket.io', transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('connect', () => {
      s.emit('join', { roomId, userName });
    });
    s.on('room_state', (payload) => {
      setRoom(prev => {
        const next = payload;
        const nextOptions = next?.menuOptions;
        if (prev && nextOptions && Array.isArray(nextOptions) && nextOptions.length < 4 && (prev.menuOptions?.length || 0) >= 4) {
          return { ...next, menuOptions: prev.menuOptions };
        }
        return next;
      });
    });
    s.on('vote_updated', (payload) => {
      setRoom(prev => {
        const next = payload?.room || payload;
        if (!next) return prev;
        const nextOptions = next.menuOptions;
        if (prev && nextOptions && Array.isArray(nextOptions) && nextOptions.length < 4 && (prev.menuOptions?.length || 0) >= 4) {
          return { ...prev, ...next, menuOptions: prev.menuOptions, votes: next.votes ?? prev.votes };
        }
        return prev ? { ...prev, ...next } : next;
      });
    });
    s.on('result', (payload) => {
      onShowResult(payload.winner, payload.votes, payload.room?.baseOptions);
    });
    s.on('error', (err) => {
      console.error(err);
    });

    return () => {
      s.disconnect();
    };
  }, [roomId, userName, onShowResult]);

  const handleVote = (menuId) => {
    if (!socket) return;
    setMyVote(menuId);
    socket.emit('vote', { roomId, menuId });
  };

  const handleFinalize = () => {
    if (!socket) return;
    socket.emit('finalize', { roomId });
  };

  if (!room) {
    return (
      <div className="room">
        <p>방 정보 불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="room">
      <div className="room-header">
        <span className="room-code">방 코드: <strong>{roomId}</strong></span>
        <span className="participants">👥 {room.participants}명</span>
        <button type="button" className="btn ghost small" onClick={onLeave}>나가기</button>
      </div>

      {room.baseOptions && (room.baseOptions.weather || room.baseOptions.category || room.baseOptions.mood || room.baseOptions.internalCafeteria) && (
        <div className="room-base-options">
          <span className="room-base-title">방 설정</span>
          <ul>
            {room.baseOptions.weather && <li>날씨: {room.baseOptions.weather}</li>}
            {room.baseOptions.category && <li>면/밥: {room.baseOptions.category}</li>}
            {room.baseOptions.mood && <li>기분: {room.baseOptions.mood}</li>}
            {room.baseOptions.internalCafeteria && <li>내부식당: {room.baseOptions.internalCafeteria}</li>}
          </ul>
        </div>
      )}

      <h2>어떤 메뉴가 좋아요?</h2>
      <p className="hint">클릭하면 실시간으로 반영돼요.</p>

      <div className="menu-grid">
        {room.menuOptions.map((menu) => (
          <button
            key={menu.id}
            type="button"
            className={`menu-card ${myVote === menu.id ? 'voted' : ''}`}
            onClick={() => handleVote(menu.id)}
          >
            <span className="menu-emoji">{getMenuEmoji(menu.name)}</span>
            <span className="menu-name">{menu.name}</span>
            <span className="vote-count">{room.votes[menu.id] ?? 0}표</span>
          </button>
        ))}
      </div>

      <div className="share-link">
        친구들에게 이 링크를 공유하세요:{' '}
        <a href={`${window.location.origin}${window.location.pathname}#${roomId}`} target="_blank" rel="noopener noreferrer">
          {window.location.origin}{window.location.pathname}#{roomId}
        </a>
      </div>
      <div className="room-actions">
        <button type="button" className="btn primary" onClick={handleFinalize}>
          결과 보기
        </button>
      </div>
    </div>
  );
}
