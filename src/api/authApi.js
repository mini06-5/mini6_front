const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL || "http://54.205.182.125:8080/users";
 
const AUTH_STORAGE_KEY = "aivlebooks_auth";
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";
 
const createMockAuth = ({ userId, name, email, nickname }) => ({
  accessToken: `mock-token-${userId}`,
  refreshToken: `mock-refresh-token-${userId}`,
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
    refreshToken: payload.refreshToken || "",
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
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "인증 요청에 실패했습니다.");
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
 
  return requestAuth("/login", { userId, password }, () => createMockAuth({ userId }));
};
 
export const signup = ({ userId, password, name, email, nickname }) => {
  if (
    !userId?.trim() ||
    !password?.trim() ||
    !nickname?.trim() ||
    !name?.trim() ||
    !email?.trim()
  ) {
    throw new Error("아이디, 비밀번호, 닉네임, 이름, 이메일을 입력해주세요.");
  }
 
  const signupBody = {
    userId,
    password,
    name,
    email,
    nickname,
  };
 
  return requestAuth("/register", signupBody, () =>
    createMockAuth({ userId, name, email, nickname }),
  ).then(() => login({ userId, password }));
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("리프레시 토큰이 없습니다.");
  }

  const response = await fetch(`${AUTH_API_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "토큰 재발급에 실패했습니다.");
  }

  const data = await response.json();
  return data?.accessToken || data?.data?.accessToken || "";
};

export const logout = async (authFetch) => {
  const response = await authFetch(`${AUTH_API_URL}/logout`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "로그아웃 요청에 실패했습니다.");
  }
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

export const normalizeMyPageResponse = (data, fallbackUser = {}) => {
  const payload = data?.data || data || {};
  const user = payload.user || payload.member || payload.profile || payload;

  return {
    accessToken: payload.accessToken || "",
    refreshToken: payload.refreshToken || "",
    user: {
      id: user.id || fallbackUser.id || fallbackUser.userId,
      userId: user.userId || user.loginId || fallbackUser.userId || "",
      loginId: user.loginId || user.userId || fallbackUser.loginId || "",
      name: user.name || fallbackUser.name || "",
      email: user.email || fallbackUser.email || "",
      nickname:
        user.nickname ||
        fallbackUser.nickname ||
        user.name ||
        user.loginId ||
        user.userId ||
        "",
    },
  };
};

export const getMyPage = async (authFetch, fallbackUser) => {
  const response = await authFetch(`${AUTH_API_URL}/me`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "마이페이지 정보를 불러오지 못했습니다.");
  }

  const data = await response.json();
  return normalizeMyPageResponse(data, fallbackUser);
};

export const updateMyProfile = async (authFetch, formData, fallbackUser) => {
  const response = await authFetch(`${AUTH_API_URL}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "프로필 정보를 수정하지 못했습니다.");
  }

  const data = await response.json();
  return normalizeMyPageResponse(data, fallbackUser);
};
