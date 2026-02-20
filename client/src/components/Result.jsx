/**
 * 결과 화면: 1등 메뉴 + 내 위치 기반 음식점 3~5곳 추천
 */
import { useState, useEffect } from 'react';
import { safeJsonFetch } from '../api';
import { API_BASE } from '../config';
import './Result.css';

const API = `${API_BASE}/api`;

const MENU_EMOJI_MAP = {
  '한식': '🍚', '중식': '🥟', '일식': '🍣', '양식': '🍝', '분식': '🍢',
  '치킨': '🍗', '면요리': '🍜', '김치찌개': '🥘', '제육볶음': '🥢', '기타': '🍽️'
};
function getMenuEmoji(name) {
  return MENU_EMOJI_MAP[name] || '🍽️';
}

export default function Result({ winner, baseOptions, onAgain }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // 내 위치 가져오기 (브라우저 Geolocation API)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 기능을 지원하지 않아요.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError('');
      },
      () => {
        setLocationError('위치를 허용해 주세요. 음식점 추천을 받을 수 있어요.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // 위치가 잡히면 음식점 검색
  useEffect(() => {
    if (!winner?.name || !location) return;
    setLoading(true);
    setMessage('');
    safeJsonFetch(
      `${API}/restaurants?lat=${location.lat}&lng=${location.lng}&keyword=${encodeURIComponent(winner.name)}`
    )
      .then(({ data }) => {
        setRestaurants(data.restaurants || []);
        setMessage(data.message || '');
      })
      .catch(() => {
        setRestaurants([]);
        setMessage('서버에 연결할 수 없어요. 서버가 켜져 있는지 확인해 주세요.');
      })
      .finally(() => setLoading(false));
  }, [winner?.name, location]);

  if (!winner) return null;

  const hasBaseOptions = baseOptions && (baseOptions.weather || baseOptions.category || baseOptions.mood || baseOptions.internalCafeteria);

  return (
    <div className="result">
      <h1 className="result-title">🎉 오늘의 메뉴</h1>
      <p className="winner-name">
        <span className="winner-emoji">{getMenuEmoji(winner.name)}</span>
        {winner.name}
      </p>

      {hasBaseOptions && (
        <div className="result-base-options">
          <span className="result-base-title">방 설정</span>
          <ul>
            {baseOptions.weather && <li>날씨: {baseOptions.weather}</li>}
            {baseOptions.category && <li>면/밥: {baseOptions.category}</li>}
            {baseOptions.mood && <li>기분: {baseOptions.mood}</li>}
            {baseOptions.internalCafeteria && <li>내부식당: {baseOptions.internalCafeteria}</li>}
          </ul>
        </div>
      )}

      <section className="restaurants-section">
        <h2>📍 내 주변 추천 음식점 (최대 5곳)</h2>
        {locationError && <p className="location-error">{locationError}</p>}
        {!location && !locationError && <p>위치 확인 중…</p>}
        {message && <p className="message">{message}</p>}
        {loading && restaurants.length === 0 && <p>검색 중…</p>}
        <ul className="restaurant-list">
          {restaurants.map((r) => (
            <li key={r.id} className="restaurant-card">
              <div className="restaurant-name">{r.name}</div>
              <div className="restaurant-address">{r.roadAddress || r.address}</div>
              {r.distance != null && (
                <div className="restaurant-distance">도보 약 {Math.round(r.distance)}m</div>
              )}
              {r.placeUrl && (
                <a href={r.placeUrl} target="_blank" rel="noopener noreferrer" className="link">
                  카카오맵에서 보기
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <button type="button" className="btn primary" onClick={onAgain}>
        다시 하기
      </button>
    </div>
  );
}
