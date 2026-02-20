/**
 * 개발 모드: API·소켓을 서버(3001)에 직접 연결 (프록시 의존 제거)
 * 빌드/배포: 같은 호스트 기준 상대 경로 사용
 */
const isDev = import.meta.env.DEV;
const SERVER_URL = 'http://localhost:3001';

export const API_BASE = isDev ? SERVER_URL : '';
export const SOCKET_URL = isDev ? SERVER_URL : (typeof window !== 'undefined' ? window.location.origin : '');
