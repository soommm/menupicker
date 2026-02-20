/**
 * 점심 메뉴 고르기 - 백엔드 서버
 * 
 * 하는 일:
 * 1. "방" 만들기 / 입장 / 투표 (REST API + Socket.io 실시간)
 * 2. 선정된 메뉴로 내 위치 기반 음식점 3~5곳 추천 (카카오 API)
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const server = http.createServer(app);

// Socket.io: 배포 시 다양한 오리진 허용 (같은 호스트 서빙 시 동작)
const io = new Server(server, {
  cors: { origin: true }
});

// ========== 방 & 투표 데이터 (메모리 저장 - 나중에 DB로 바꿀 수 있어요)
// rooms[roomId] = { id, menuOptions: [], votes: { menuId: 참가자수 }, participants: [] }
const rooms = new Map();

// 6자리 랜덤 방 코드 생성
function makeRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// ========== REST API

// 방 만들기
app.post('/api/rooms', (req, res) => {
  const roomId = makeRoomId();
  const { hostName = '방장', menuOptions = [], baseOptions = {} } = req.body;

  // 선택사항 풀: 4개 미만일 때 여기서 채움. 최소 4개, 최대 8개.
  const defaultMenus = ['한식', '중식', '일식', '양식', '분식', '치킨', '면요리', '기타'];
  // 배열이 아닌 경우(단일 문자열 등)도 1개 메뉴로 처리되도록 정규화
  const raw = menuOptions == null ? [] : Array.isArray(menuOptions) ? menuOptions : [menuOptions];
  let names = raw.map(n => String(n).trim()).filter(Boolean);

  if (names.length < 4) {
    const used = new Set(names.map(n => n));
    for (const m of defaultMenus) {
      if (names.length >= 4) break;
      if (!used.has(m)) {
        names.push(m);
        used.add(m);
      }
    }
  }
  // 최종 보장: 4개 미만이면 한 번 더 채움 (엣지 케이스 방지)
  if (names.length < 4) {
    const used = new Set(names);
    for (const m of defaultMenus) {
      if (names.length >= 4) break;
      if (!used.has(m)) {
        names.push(m);
        used.add(m);
      }
    }
  }
  if (names.length > 8) names = names.slice(0, 8);

  const options = names.map((name, i) => ({ id: `m${i}`, name }));

  const votes = {};
  options.forEach(m => { votes[m.id] = 0; });

  const roomBase = {
    weather: baseOptions.weather || '',
    category: baseOptions.category || '',
    mood: baseOptions.mood || '',
    internalCafeteria: baseOptions.internalCafeteria || ''
  };

  rooms.set(roomId, {
    id: roomId,
    hostName,
    menuOptions: options,
    votes,
    baseOptions: roomBase,
    participants: [{ id: 'host', name: hostName, isHost: true }],
    createdAt: Date.now()
  });

  return res.status(201).json({
    roomId,
    joinLink: `${req.protocol}://${req.get('host')?.replace(/:\d+$/, '')}/join/${roomId}`,
    room: getRoomSummary(roomId)
  });
});

// 방 정보 조회 (입장 시)
app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: '방을 찾을 수 없어요.' });
  return res.json(getRoomSummary(room.id));
});

// 방 목록 (간단히)
function getRoomSummary(roomId) {
  const r = rooms.get(roomId);
  if (!r) return null;
  const menuOptions = (r.menuOptions || []).map(m => ({ ...m }));
  return {
    id: r.id,
    hostName: r.hostName,
    menuOptions,
    votes: { ...r.votes },
    baseOptions: r.baseOptions || {},
    participants: r.participants.length,
    participantNames: r.participants.map(p => p.name)
  };
}

// ========== Socket.io: 실시간 입장 / 투표 / 결과

io.on('connection', (socket) => {
  // 방 입장
  socket.on('join', ({ roomId, userName }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: '방을 찾을 수 없어요.' });
      return;
    }
    socket.join(roomId);
    const participant = {
      id: socket.id,
      name: userName || `참가자${room.participants.length}`,
      isHost: false
    };
    room.participants.push(participant);
    socket.roomId = roomId;
    socket.userName = participant.name;

    // 입장 알림
    io.to(roomId).emit('participant_joined', {
      participants: room.participants.length,
      participantNames: room.participants.map(p => p.name)
    });
    io.to(roomId).emit('room_state', getRoomSummary(roomId));
  });

  // 투표
  socket.on('vote', ({ roomId, menuId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    if (!room.menuOptions.some(m => m.id === menuId)) return;

    // 기존에 이 참가자가 투표한 메뉴가 있으면 -1
    if (socket.lastVote) {
      room.votes[socket.lastVote] = Math.max(0, (room.votes[socket.lastVote] || 0) - 1);
    }
    socket.lastVote = menuId;
    room.votes[menuId] = (room.votes[menuId] || 0) + 1;

    io.to(roomId).emit('vote_updated', {
      votes: { ...room.votes },
      room: getRoomSummary(roomId)
    });
  });

  // 최종 결과 확정 (방장이 "결과 보기" 누를 때)
  socket.on('finalize', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const winner = getWinner(room);
    io.to(roomId).emit('result', {
      winner,
      votes: { ...room.votes },
      room: getRoomSummary(roomId)
    });
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    room.participants = room.participants.filter(p => p.id !== socket.id);
    if (socket.lastVote && room.votes[socket.lastVote] > 0) {
      room.votes[socket.lastVote]--;
    }
    io.to(roomId).emit('participant_joined', {
      participants: room.participants.length,
      participantNames: room.participants.map(p => p.name)
    });
    io.to(roomId).emit('room_state', getRoomSummary(roomId));
  });
});

function getWinner(room) {
  let max = 0;
  let winner = room.menuOptions[0];
  for (const m of room.menuOptions) {
    const v = room.votes[m.id] || 0;
    if (v > max) {
      max = v;
      winner = m;
    }
  }
  return winner;
}

// ========== 음식점 추천 API (카카오 로컬 API 사용)
// 내 위치(lat, lng) + 선정 메뉴(keyword)로 주변 3~5곳 검색

app.get('/api/restaurants', async (req, res) => {
  const { lat, lng, keyword } = req.query;
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    return res.json({
      ok: false,
      message: '음식점 검색을 쓰려면 server 폴더에 .env 파일을 만들고 KAKAO_REST_API_KEY=발급받은키 를 넣어주세요.',
      restaurants: []
    });
  }

  if (!lat || !lng || !keyword) {
    return res.status(400).json({
      ok: false,
      message: 'lat, lng, keyword 를 모두 보내주세요.',
      restaurants: []
    });
  }

  try {
    const query = encodeURIComponent(keyword);
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}&x=${lng}&y=${lat}&radius=2000&size=5&sort=distance`;
    const resp = await fetch(url, {
      headers: { Authorization: `KakaoAK ${apiKey}` }
    });
    const data = await resp.json();

    if (data.meta?.total_count === 0 || !data.documents?.length) {
      return res.json({
        ok: true,
        keyword,
        restaurants: [],
        message: '주변에 해당 메뉴 음식점이 없어요. 키워드를 바꿔 보세요.'
      });
    }

    const restaurants = data.documents.slice(0, 5).map(d => ({
      id: d.id,
      name: d.place_name,
      address: d.address_name,
      roadAddress: d.road_address_name || d.address_name,
      lat: parseFloat(d.y),
      lng: parseFloat(d.x),
      distance: d.distance,
      placeUrl: d.place_url,
      // 카카오 키워드 검색은 가격/리뷰를 직접 안 줌. 나중에 Place 상세 API로 보강 가능
      price: null,
      reviewScore: null
    }));

    return res.json({
      ok: true,
      keyword,
      restaurants
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      ok: false,
      message: '음식점 검색 중 오류가 났어요.',
      restaurants: []
    });
  }
});

// ========== 배포: 클라이언트 빌드 결과물 서빙 (client/dist)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// ========== 서버 실행 (0.0.0.0: 외부/다른 기기에서 접속 가능)
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`서버가 http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT} 에서 실행 중이에요.`);
  if (HOST === '0.0.0.0') {
    console.log('  → 같은 네트워크의 다른 기기에서 접속하려면 이 PC의 IP 주소로 접속하세요. (예: http://192.168.0.10:3001)');
  }
});
