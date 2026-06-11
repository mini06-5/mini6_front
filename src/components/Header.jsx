import { useEffect, useMemo, useState } from "react";

const BANNER_INTERVAL_MS = 5000;

function Header({
  onMoveToStart,
  aiRecommendations = [],
  page,
  currentUser,
  onMoveToLogin,
  onMoveToSignup,
  onLogout,
  onMoveToDetail,
}) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const currentMonth = new Date().getMonth() + 1;

  const banners = useMemo(() => {
    const introBanner = {
      type: "intro",
      label: "AivleBooks 소개",
    };

    const recommendationBanners = [0, 1].map((index) => ({
      type: "recommendation",
      label: `${currentMonth}월의 AI 추천 도서 ${index + 1}`,
      book: aiRecommendations[index] || null,
    }));

    return [introBanner, ...recommendationBanners];
  }, [aiRecommendations, currentMonth]);

  useEffect(() => {
    if (currentBanner >= banners.length) {
      setCurrentBanner(0);
    }
  }, [banners.length, currentBanner]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;

    const timer = window.setTimeout(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, BANNER_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [banners.length, currentBanner]);

  const activeBanner = banners[currentBanner] || banners[0];

  const handleBannerDotClick = (index) => {
    setCurrentBanner(index);
  };

  const handleRecommendationClick = (book) => {
    if (book && onMoveToDetail) {
      onMoveToDetail(book);
    }
  };

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

      {(page === "start" || page === "list") && activeBanner && (
        <section className="hero-slider-container">
          {activeBanner.type === "intro" && (
            <div className="list-hero fade-in hero-banner" aria-label="AivleBooks 소개">
              <div>
                <strong>AivleBooks</strong>
                <p>글과 AI 표지 시안을 함께 관리하는 창작 서재</p>
              </div>
            </div>
          )}

          {activeBanner.type === "recommendation" && activeBanner.book && (
            <button
              type="button"
              className="list-hero fade-in hero-banner recommendation-banner"
              onClick={() => handleRecommendationClick(activeBanner.book)}
              aria-label={`${activeBanner.book.title} 상세 조회로 이동`}
            >
              <div>
                <strong className="recommendation-title-mark">
                  ✦ {currentMonth}월의 AI 추천 도서
                </strong>
                <p className="recommendation-book-title">
                  [{activeBanner.book.title}] - {activeBanner.book.author.nickname}
                </p>
                <p className="recommendation-reason">{activeBanner.book.reason}</p>
              </div>
            </button>
          )}

          {activeBanner.type === "recommendation" && !activeBanner.book && (
            <div
              className="list-hero fade-in hero-banner recommendation-banner recommendation-banner-loading"
              aria-label="AI 추천 도서 준비 중"
            >
              <div>
                <strong className="recommendation-title-mark">
                  ✦ {currentMonth}월의 AI 추천 도서
                </strong>
                <p className="recommendation-book-title">추천 도서를 고르는 중입니다</p>
                <p className="recommendation-reason">
                  등록된 도서의 분위기와 계절감을 살펴보고 있어요.
                </p>
              </div>
            </div>
          )}

          {banners.length > 1 && (
            <div className="hero-banner-dots" aria-label="배너 선택">
              {banners.map((banner, index) => (
                <button
                  key={`${banner.type}-${index}`}
                  type="button"
                  className={`hero-banner-dot ${currentBanner === index ? "is-active" : ""}`}
                  onClick={() => handleBannerDotClick(index)}
                  aria-label={banner.label}
                  aria-current={currentBanner === index}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default Header;
