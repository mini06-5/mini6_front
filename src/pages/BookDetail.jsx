import { useState } from "react";
import CoverImageModal from "../components/CoverImageModal";

function BookDetail({
  book,
  onMoveToList,
  onMoveBackToList,
  onMoveToUpdate,
  onMoveToCoverUpdate,
  onDelete,
  onLikeBook,
  currentUser,
}) {
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const hasCoverImage = Boolean(book?.coverImageUrl);
  const tagList = book.tags ? book.tags.split(" ") : [];
  const isLoggedIn = Boolean(currentUser);
  const isOwner =
    isLoggedIn &&
    book?.authorUserId != null &&
    String(book.authorUserId) === String(currentUser?.id);

  if (!book) {
    return (
      <>
        <main className="detail-page">
          <p>선택된 도서가 없습니다.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="detail-page">
        <section className="detail-container">
          <div className="detail-nav-buttons">
            <button
              type="button"
              className="icon-return-button"
              onClick={onMoveBackToList}
              aria-label="이전 목록 페이지로 돌아가기"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              className="list-return-button"
              onClick={onMoveToList}
              aria-label="도서 목록 첫 페이지로 이동"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 28 24"
                width="28"
                height="22"
              >
                <path d="M4 6h20" />
                <path d="M4 12h20" />
                <path d="M4 18h20" />
              </svg>
              <span>목록으로</span>
            </button>
          </div>

          <div
            className={`detail-cover ${hasCoverImage ? "has-image" : ""}`}
            onClick={() => {
              if (hasCoverImage) {
                setIsCoverOpen(true);
              }
            }}
            style={{ cursor: hasCoverImage ? "pointer" : "default" }}
          >
            {hasCoverImage ? (
              <>
                <img
                  className="cover-blur-bg"
                  src={book.coverImageUrl}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="cover-main-image"
                  src={book.coverImageUrl}
                  alt={`${book.title} 표지`}
                />
              </>
            ) : (
              <>
                <span>BOOK</span>
                <strong>{book.title}</strong>
                <em>{book.author}</em>
              </>
            )}
          </div>

          <div className="detail-info">
            <span className="tag">상세 조회</span>
            <h2>{book.title}</h2>
            {tagList.length > 0 && (
              <div
                className="tag-list"
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                {tagList.map((tag, index) => {
                  // 연속된 공백 등으로 인한 빈 태그 방지
                  if (!tag.trim()) return null;
                  return (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
            <p>저자: {book.author}</p>
            {book.publisher && <p>출판사: {book.publisher}</p>}

            <div className="content-box">
              <strong>도서 소개</strong>
              <p>{book.content}</p>
            </div>

            <p className="date-text">
              등록일: {book.createdAt.slice(0, 10)} / 수정일:{" "}
              {book.updatedAt.slice(0, 10)}
            </p>
            <div className="recommend-panel">
              <p className="likeCount">
                <span>추천수</span>
                <strong>{book.likeCount}</strong>
              </p>
              {isLoggedIn && (
                <button
                  type="button"
                  className="like-button"
                  onClick={() => onLikeBook(book)}
                  aria-label={`${book.title} 도서 추천하기`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    <path d="M7 11 11 2a3 3 0 0 1 3 3v4h4.4a2.6 2.6 0 0 1 2.5 3.2l-1.7 6.8A4 4 0 0 1 15.3 22H7V11Z" />
                  </svg>
                  <span>추천하기</span>
                </button>
              )}
            </div>

            {isOwner && <div className="detail-buttons">
              <button type="button" onClick={() => onMoveToCoverUpdate(book)}>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.45.48.83.91 1H21a2 2 0 0 1 0 4h-.09c-.43.17-.77.55-.91 1Z" />
                </svg>
                <span>표지 관리</span>
              </button>
              <button type="button" onClick={() => onMoveToUpdate(book)}>
                수정하기
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => onDelete(book)}
              >
                삭제
              </button>
            </div>}
          </div>
        </section>

        {isCoverOpen && book.coverImageUrl && (
          <CoverImageModal
            imageUrl={book.coverImageUrl}
            title={book.title}
            onClose={() => setIsCoverOpen(false)}
          />
        )}
      </main>
    </>
  );
}

export default BookDetail;
