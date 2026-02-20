/**
 * API 요청: JSON이 아닌 응답(HTML 등) 또는 네트워크 오류 시 안내 메시지
 */
const SERVER_ERROR_MSG =
  '서버에 연결할 수 없어요. 루트 폴더에서 npm run dev:all 을 실행했는지 확인해 주세요.';

export async function safeJsonFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (err?.message?.includes('fetch') || err?.name === 'TypeError') {
      throw new Error(SERVER_ERROR_MSG);
    }
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const text = await res.text();
    if (text.trimStart().startsWith('<!') || text.trimStart().startsWith('<')) {
      throw new Error(SERVER_ERROR_MSG);
    }
    throw new Error('응답 형식이 잘못됐어요.');
  }

  const data = await res.json();
  return { res, data };
}
