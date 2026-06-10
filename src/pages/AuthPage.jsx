import { useState } from "react";

function AuthPage({
  mode = "login",
  onLogin,
  onSignup,
  onMoveToLogin,
  onMoveToSignup,
  onMoveToStart,
}) {
  const isLogin = mode === "login";
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    name: "",
    email: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await onLogin({
          userId: formData.userId,
          password: formData.password,
        });
      } else {
        await onSignup(formData);
      }
    } catch (submitError) {
      setError(submitError.message || "처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="form-page auth-page">
      <section className="section-card auth-card">
        <div className="auth-header">
          <div>
            <span className="auth-eyebrow">AivleBooks Account</span>
            <h2>{isLogin ? "로그인" : "회원가입"}</h2>
          </div>
          <button type="button" className="secondary-btn" onClick={onMoveToStart}>
            홈으로
          </button>
        </div>

        <form className="book-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="아이디를 입력해주세요"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>닉네임</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="도서 저자명으로 표시될 닉네임"
                />
              </div>

              <div className="form-group">
                <label>이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력해주세요"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label>이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력해주세요"
                  autoComplete="email"
                />
              </div>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="form-buttons">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "처리 중..."
                : isLogin
                  ? "로그인"
                  : "가입하기"}
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={isLogin ? onMoveToSignup : onMoveToLogin}
            >
              {isLogin ? "회원가입" : "로그인으로"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;

