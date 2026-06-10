const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL || "http://localhost:8080/auth";

const AUTH_STORAGE_KEY = "aivlebooks_auth";
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";

const createMockAuth = ({ userId, name, email, nickname }) => ({
  accessToken: `mock-token-${userId}`,
  user: {
    userId,
    name: name || userId,
    email: email || `${userId}@aivlebooks.local`,
    nickname: nickname || name || userId,
  },
});

const normalizeAuthResponse = (data, fallbackUserId) => {
  const payload = data?.data || data || {};
  const user = payload.user || payload.member || payload;

  return {
    accessToken: payload.accessToken || payload.token || "",
    user: {
      id: user.id || user.userId || fallbackUserId,
      userId: user.userId || user.loginId || fallbackUserId || user.id,
      loginId: user.loginId || user.userId || fallbackUserId || "",
      name: user.name || "",
      email: user.email || "",
      nickname:
        user.nickname || user.name || user.loginId || user.userId || fallbackUserId,
    },
  };
};

const requestAuth = async (path, body, fallbackFactory) => {
  try {
    const response = await fetch(`${AUTH_API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("인증 요청에 실패했습니다.");
    }

    const data = await response.json();
    return normalizeAuthResponse(data, body.userId || body.loginId);
  } catch (error) {
    if (!USE_MOCK_AUTH) {
      throw error;
    }

    return fallbackFactory();
  }
};

export const login = ({ userId, password }) => {
  if (!userId?.trim() || !password?.trim()) {
    throw new Error("아이디와 비밀번호를 입력해주세요.");
  }

  return requestAuth(
    "/login",
    { loginId: userId, password },
    () => createMockAuth({ userId }),
  );
};

export const signup = ({ userId, password, name, email, nickname }) => {
  if (!userId?.trim() || !password?.trim() || !nickname?.trim()) {
    throw new Error("아이디, 비밀번호, 닉네임을 입력해주세요.");
  }

  const signupBody = {
    loginId: userId,
    password,
    name: name || nickname,
    nickname,
  };

  return requestAuth("/signup", signupBody, () =>
    createMockAuth({ userId, name, email, nickname }),
  ).then(() => login({ userId, password }));
};

export const saveAuth = (auth) => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const getStoredAuth = () => {
  try {
    const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return savedAuth ? JSON.parse(savedAuth) : null;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
