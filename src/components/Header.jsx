import { useState, useEffect } from "react";
function Header({
  onMoveToStart,
  aiRecommendation,
  page,
  currentUser,
  onMoveToLogin,
  onMoveToSignup,
  onLogout,
}) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <header className="header">
        <div className="header-logo">
          <button
            type="button"
            className="home-button"
            onClick={onMoveToStart}
            aria-label="홈으로 이동"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
              <path d="M3 10.8 12 3l9 7.8" />
              <path d="M5.5 9.7V21h13V9.7" />
              <path d="M9.5 21v-6h5v6" />
            </svg>
          </button>
          <button type="button" className="brand-title" onClick={onMoveToStart}>
            AivleBooks
          </button>
        </div>
        <div className="header-auth">
          {currentUser ? (
            <>
              <span className="user-chip">{currentUser.nickname}</span>
              <button type="button" className="secondary-btn" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="secondary-btn"
                onClick={onMoveToLogin}
              >
                로그인
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={onMoveToSignup}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>
      {(page === "start" || page === "list") && (
        <section
          className="hero-slider-container"
          style={{ position: "relative", marginBottom: "32px" }}
        >
          {currentBanner === 0 && (
            <div
              className="list-hero fade-in"
              aria-label="AivleBooks 소개"
              style={{
                height: "160px",
                display: "flex",
              }}
            >
              <div>
                <strong>AivleBooks</strong>
                <p>글과 AI 표지 시안을 함께 관리하는 창작 서재</p>
              </div>
            </div>
          )}

          {currentBanner === 1 && aiRecommendation && (
            <div
              className="list-hero fade-in"
              style={{
                backgroundColor: "#eef2ff",
                color: "violet",
                cursor: "pointer",
                height: "160px",
              }}
              aria-label="이 달의 GPT 추천 도서"
            >
              <div>
                <strong>✨ {currentMonth}월의 AI 추천 도서</strong>
                <p style={{ marginTop: "8px", fontWeight: "bold" }}>
                  [{aiRecommendation.title}] - {aiRecommendation.author}
                </p>
                <p
                  style={{ marginTop: "4px", fontSize: "0.9rem", opacity: 0.8 }}
                >
                  🤖 "{aiRecommendation.reason}"
                </p>
              </div>
            </div>
          )}
          {currentBanner === 1 && !aiRecommendation && (
            <div
              className="list-hero fade-in"
              style={{
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                height: "160px",
                display: "flex",
              }}
            >
              <div>
                <strong>✨ {currentMonth}월의 AI 추천 도서</strong>
                <p style={{ marginTop: "12px", fontSize: "0.95rem" }}>
                  🤖 AI 큐레이션을 준비 중이거나 불러오지 못했습니다.
                  <br />
                  잠시 후 다시 확인해 주세요.
                </p>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              position: "absolute",
              bottom: "16px",
              width: "100%",
            }}
          >
            <button
              onClick={() => setCurrentBanner(0)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "none",
                backgroundColor:
                  currentBanner === 0 ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => setCurrentBanner(1)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "none",
                backgroundColor:
                  currentBanner === 1 ? "#3b82f6" : "rgba(59,130,246,0.3)",
                cursor: "pointer",
              }}
            />
          </div>
        </section>
      )}
    </>
  );
}

export default Header;
