import { useMemo } from "react";
import BookCard from "../components/BookCard";

const BOOKS_PER_PAGE = 12;

function BookList({
  books = [],
  search,
  onSearch,
  onClearSearch,
  type,
  onType,
  currentPage,
  onPageChange,
  onMoveToDetail,
  onMoveToCreate,
}) {
  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedBooks = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * BOOKS_PER_PAGE;

    return books.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  }, [books, safeCurrentPage]);

  const handleSearchChange = (value) => {
    onPageChange(1);
    onSearch(value);
  };

  return (
    <>
      <main className="book-list-page">
        <section className="section-card">
          <div className="page-title-row">
            <h2>도서 목록</h2>
            <div className="list-actions">
              <div className="search-box">
                <select
                  className="search-type-select"
                  value={type}
                  onChange={(e) => {
                    onType(e.target.value);
                  }}
                >
                  <option value="all">전체</option>
                  <option value="title">제목</option>
                  <option value="author">작가</option>
                  <option value="publisher">출판사</option>
                  <option value="content">내용</option>
                  <option value="tag">태그</option>
                </select>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="도서를 검색해주세요"
                />
                {search && (
                  <button
                    type="button"
                    className="search-clear-button"
                    onClick={onClearSearch}
                    aria-label="검색어 지우기"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                    >
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>

              <button
                type="button"
                className="create-button"
                onClick={onMoveToCreate}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                <span>새 도서 등록</span>
              </button>
            </div>
          </div>

          {books.length > 0 ? (
            <>
              <div className="book-grid">
                {pagedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => onMoveToDetail(book)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pagination" aria-label="도서 목록 페이지">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        className={
                          pageNumber === safeCurrentPage ? "is-active" : ""
                        }
                        onClick={() => onPageChange(pageNumber)}
                        aria-current={
                          pageNumber === safeCurrentPage ? "page" : undefined
                        }
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </nav>
              )}
            </>
          ) : (
            <div className="empty-state">검색 결과에 맞는 도서가 없습니다.</div>
          )}
        </section>
      </main>
    </>
  );
}

export default BookList;
