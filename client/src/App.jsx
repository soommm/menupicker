/**
 * 앱 전체 흐름
 * - 홈: 방 만들기 / 방 코드로 입장
 * - 방: 실시간 투표
 * - 결과: 1등 메뉴 + 위치 기반 음식점 추천
 */
import { useState } from 'react';
import Home from './components/Home';
import Room from './components/Room';
import Result from './components/Result';

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'room' | 'result'
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [winner, setWinner] = useState(null);
  const [baseOptions, setBaseOptions] = useState(null);

  const goToRoom = (id, name, data) => {
    setRoomId(id);
    setUserName(name);
    setRoomData(data);
    setScreen('room');
  };

  const goToResult = (resultWinner, votes, options) => {
    setWinner({ ...resultWinner, votes });
    setBaseOptions(options || null);
    setScreen('result');
  };

  const goHome = () => {
    setScreen('home');
    setRoomId('');
    setUserName('');
    setRoomData(null);
    setWinner(null);
    setBaseOptions(null);
  };

  const showHeader = screen === 'room' || screen === 'result';

  return (
    <div className={`app${screen === 'home' ? ' app--home' : ''}`}>
      {showHeader && (
        <header className="app-header">
          <div className="app-header-inner">
            <button type="button" className="app-header-btn app-header-back" onClick={goHome} aria-label="뒤로 가기">
              <span className="app-header-icon" aria-hidden>&lt;</span>
            </button>
            <span className="app-header-spacer" />
            <button type="button" className="app-header-btn app-header-home" onClick={goHome} aria-label="홈">
              <svg className="app-header-icon app-header-icon--home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          </div>
        </header>
      )}
      {screen === 'home' && (
        <Home
          onJoinRoom={goToRoom}
        />
      )}
      {screen === 'room' && (
        <Room
          roomId={roomId}
          userName={userName}
          initialRoom={roomData}
          onShowResult={goToResult}
          onLeave={goHome}
        />
      )}
      {screen === 'result' && (
        <Result
          winner={winner}
          baseOptions={baseOptions}
          onAgain={goHome}
        />
      )}
    </div>
  );
}
