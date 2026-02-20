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

  return (
    <div className={`app${screen === 'home' ? ' app--home' : ''}`}>
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
