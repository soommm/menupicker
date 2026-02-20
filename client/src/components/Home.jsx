/**
 * 홈 화면: 방 만들기 / 방 코드로 입장
 */
import { useState, useEffect } from 'react';
import { safeJsonFetch } from '../api';
import { API_BASE } from '../config';
import SlotMachine from './SlotMachine';
import './Home.css';

const API = `${API_BASE}/api`;

// 서버와 동일한 추천 풀 (최소 4개~최대 8개, 4개 미만일 때 선택 제안용)
const DEFAULT_MENUS = ['한식', '중식', '일식', '양식', '분식', '치킨', '면요리', '기타'];

function parseMenuOptions(text) {
  if (!text || !String(text).trim()) return [];
  return String(text).split(/[,，]/).map(s => s.trim()).filter(Boolean);
}

export default function Home({ onJoinRoom }) {
  const [mode, setMode] = useState('choose'); // 'choose' | 'create' | 'join' | 'random'
  const [randomRunId, setRandomRunId] = useState(0);
  const [hostName, setHostName] = useState('');
  const [menuText, setMenuText] = useState(''); // 한 줄에 메뉴 쉼표로 구분
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 방장이 설정하는 base 데이터 (방 생성 시)
  const [baseOptions, setBaseOptions] = useState({
    weather: '',
    category: '',       // 면/밥
    mood: '',           // 기분
    internalCafeteria: ''
  });

  // 주소에 #방코드 가 있으면 입장 화면으로 + 코드 자동 입력
  useEffect(() => {
    const hash = (window.location.hash || '').replace(/^#/, '').trim().toUpperCase();
    if (hash.length === 6) {
      setJoinCode(hash);
      setMode('join');
    }
  }, []);

  // 방 만들기
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const menuOptions = parseMenuOptions(menuText);
      const { res, data } = await safeJsonFetch(`${API}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: hostName || '방장',
          menuOptions,
          baseOptions: baseOptions
        })
      });
      if (!res.ok) throw new Error(data.error || '방 만들기 실패');
      onJoinRoom(data.roomId, data.room.hostName || hostName || '방장', data.room);
    } catch (err) {
      setError(err.message || '방 만들기에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  // 방 입장
  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    const code = joinCode.trim().toUpperCase().replace(/\s/g, '');
    if (!code) {
      setError('방 코드 6자를 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const { res, data } = await safeJsonFetch(`${API}/rooms/${code}`);
      if (!res.ok) throw new Error(data.error || '방을 찾을 수 없어요.');
      onJoinRoom(code, joinName || '참가자', data);
    } catch (err) {
      setError(err.message || '입장에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <header className="home-header" aria-hidden>
        <div className="home-awning">
          <svg className="home-awning__svg" viewBox="0 0 420 56" preserveAspectRatio="none">
            <defs>
              <pattern id="awning-stripes" patternUnits="userSpaceOnUse" width="54" height="56">
                <rect x="0" width="27" height="56" fill="#c41e3a" />
                <rect x="27" width="27" height="56" fill="#ffffff" />
              </pattern>
              <clipPath id="awning-scallop">
                <path d="M0,0 L420,0 L420,29 L393,56 L366,29 L339,56 L312,29 L285,56 L258,29 L231,56 L204,29 L177,56 L150,29 L123,56 L96,29 L69,56 L42,29 L15,56 L0,29 Z" />
              </clipPath>
            </defs>
            <rect x="0" y="0" width="420" height="56" fill="url(#awning-stripes)" clipPath="url(#awning-scallop)" />
          </svg>
        </div>
      </header>
      <h1 className="title">🍚 점심 메뉴 고르기</h1>
      <p className="subtitle">친구, 동료들과 실시간으로 식사 메뉴를 정해 보세요!</p>

      {mode === 'choose' && (
        <>
          <SlotMachine />
          <div className="choose-mode">
            <button type="button" className="btn primary" onClick={() => setMode('create')}>
              방 만들기
            </button>
            <button type="button" className="btn secondary" onClick={() => setMode('join')}>
              방 코드로 입장
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setRandomRunId((n) => n + 1);
                setMode('random');
              }}
            >
              랜덤 메뉴 뽑기
            </button>
          </div>
        </>
      )}

      {mode === 'random' && (
        <>
          <SlotMachine key={`random-${randomRunId}`} oneInFiveMatch />
          <div className="choose-mode random-actions" style={{ marginTop: 24 }}>
            <button
              type="button"
              className="btn primary"
              onClick={() => setRandomRunId((n) => n + 1)}
            >
              다시 고르기
            </button>
            <button
              type="button"
              className="btn text"
              onClick={() => setMode('choose')}
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </>
      )}

      {mode === 'create' && (() => {
        const currentOptions = parseMenuOptions(menuText);
        const needMore = Math.max(0, 4 - currentOptions.length);
        const canAddMore = Math.max(0, 8 - currentOptions.length);
        const currentSet = new Set(currentOptions);
        const suggested = DEFAULT_MENUS.filter(m => !currentSet.has(m)).slice(0, Math.max(needMore, canAddMore));
        const addSuggestion = (name) => {
          if (currentOptions.length >= 8) return;
          setMenuText(prev => {
            const arr = parseMenuOptions(prev);
            if (arr.includes(name)) return prev;
            return arr.length ? `${prev}, ${name}` : name;
          });
        };
        return (
        <form className="card form" onSubmit={handleCreate}>
          <h2>방 만들기</h2>
          <label>
            방장 이름
            <input
              type="text"
              placeholder="이름"
              value={hostName}
              onChange={e => setHostName(e.target.value)}
            />
          </label>
          <label>
            메뉴 후보 (최소 4개, 최대 8개. 쉼표로 구분)
            <input
              type="text"
              placeholder="예: 김치찌개, 제육볶음, 돈까스"
              value={menuText}
              onChange={e => setMenuText(e.target.value)}
            />
          </label>
          {currentOptions.length < 4 && suggested.length > 0 && (
            <div className="menu-suggestions">
              <span className="menu-suggestions-title">4개가 되도록 아래에서 골라 주세요</span>
              <div className="menu-suggestions-chips">
                {suggested.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="menu-suggestion-chip"
                    onClick={() => addSuggestion(name)}
                    disabled={currentOptions.length >= 8}
                  >
                    + {name}
                  </button>
                ))}
              </div>
              <p className="menu-suggestions-hint">현재 {currentOptions.length}개 (최소 4개 필요)</p>
            </div>
          )}
          {currentOptions.length >= 4 && currentOptions.length < 8 && (
            <p className="menu-suggestions-hint">현재 {currentOptions.length}개 (최대 8개까지 추가 가능)</p>
          )}
          <div className="base-options">
            <span className="base-options-title">방 설정 (선택)</span>
            <label>
              날씨
              <select value={baseOptions.weather} onChange={e => setBaseOptions(o => ({ ...o, weather: e.target.value }))}>
                <option value="">선택 안 함</option>
                <option value="맑음">맑음</option>
                <option value="흐림">흐림</option>
                <option value="비">비</option>
                <option value="눈">눈</option>
                <option value="더움">더움</option>
                <option value="추움">추움</option>
              </select>
            </label>
            <label>
              면/밥
              <select value={baseOptions.category} onChange={e => setBaseOptions(o => ({ ...o, category: e.target.value }))}>
                <option value="">선택 안 함</option>
                <option value="면">면</option>
                <option value="밥">밥</option>
                <option value="둘 다">둘 다</option>
              </select>
            </label>
            <label>
              기분
              <select value={baseOptions.mood} onChange={e => setBaseOptions(o => ({ ...o, mood: e.target.value }))}>
                <option value="">선택 안 함</option>
                <option value="가볍게">가볍게</option>
                <option value="든든하게">든든하게</option>
                <option value="매운거">매운거</option>
                <option value="칼로리 낮게">칼로리 낮게</option>
              </select>
            </label>
            <label>
              내부식당
              <select value={baseOptions.internalCafeteria} onChange={e => setBaseOptions(o => ({ ...o, internalCafeteria: e.target.value }))}>
                <option value="">선택 안 함</option>
                <option value="포함">포함</option>
                <option value="불포함">불포함</option>
              </select>
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => setMode('choose')}>
              뒤로
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? '만드는 중…' : '방 만들기'}
            </button>
          </div>
        </form>
        );
      })()}

      {mode === 'join' && (
        <form className="card form" onSubmit={handleJoin}>
          <h2>방 입장</h2>
          <label>
            방 코드 (6자)
            <input
              type="text"
              placeholder="예: ABC123"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </label>
          <label>
            내 이름
            <input
              type="text"
              placeholder="이름"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => setMode('choose')}>
              뒤로
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? '입장 중…' : '입장하기'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
