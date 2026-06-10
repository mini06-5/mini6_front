import { useCallback, useEffect, useMemo, useState } from "react";
import BookList from "./pages/BookList";
import BookDetail from "./pages/BookDetail";
import BookCreate from "./pages/BookCreate";
import BookUpdate from "./pages/BookUpdate";
import CoverUpdate from "./pages/CoverUpdate";
import StartPage from "./pages/StartPage";
import AuthPage from "./pages/AuthPage";
import Header from "./components/Header";
import {
  clearAuth,
  getStoredAuth,
  login as loginUser,
  saveAuth,
  signup as signupUser,
} from "./api/authApi";
const API_URL = import.meta.env.VITE_BOOK_API_URL || "http://localhost:8080/books";

const normalizeBooks = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
};

function App() {
  const [page, setPage] = useState("start");
  const [books, setBooks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [listPage, setListPage] = useState(1);
  const [message, setMessage] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [auth, setAuth] = useState(() => getStoredAuth());

  const currentUser = auth?.user || null;
  const authToken = auth?.accessToken || "";

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedId) || null,
    [books, selectedId],
  );

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return books;

    if (keyword.startsWith("#")) {
      const searchTag = keyword.replace(/^#/, "").trim();

      if (!searchTag) return books;

      return books.filter((book) => {
        if (!book.tags) return false;

        const tagArray = book.tags.toLowerCase().replace(/#/g, "").split(" ");
        return tagArray.some((tag) => tag.includes(searchTag));
      });
    }

    return books.filter((book) => {
      switch (type) {
        case "title":
          return book.title.toLowerCase().includes(keyword);
        case "author":
          return book.author.toLowerCase().includes(keyword);
        case "publisher":
          return book.publisher.toLowerCase().includes(keyword);
        case "content":
          return book.content.toLowerCase().includes(keyword);
        case "tag":
          return book.tags?.toLowerCase().includes(keyword);
        default:
          return (
            book.title.toLowerCase().includes(keyword) ||
            book.author.toLowerCase().includes(keyword) ||
            book.publisher.toLowerCase().includes(keyword) ||
            book.content.toLowerCase().includes(keyword) ||
            book.tags?.toLowerCase().includes(keyword)
          );
      }
    });
  }, [books, search, type]);

  const popularBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => {
        const likeA = a.likeCount || 0;
        const likeB = b.likeCount || 0;
        if (likeA !== likeB) {
          return likeB - likeA;
        }
        return b.id - a.id;
      })
      .slice(0, 3);
  }, [books]);

  const newBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => {
        const dateA = a.createdAt || "";
        const dateB = b.createdAt || "";
        if (dateA !== dateB) {
          return dateB.localeCompare(dateA);
        }
        return b.id - a.id;
      })
      .slice(0, 3);
  }, [books]);

  const loadBooks = useCallback(async () => {
    try {
      const res = await fetch(API_URL);

      if (!res.ok) {
        throw new Error("도서 목록을 불러오지 못했습니다.");
      }

      const data = await res.json();
      const nextBooks = normalizeBooks(data);

      setBooks(nextBooks);
      setSelectedId((prevId) => prevId ?? nextBooks[0]?.id ?? null);
    } catch (error) {
      console.error(error);
      setMessage("백엔드 서버 연결 상태를 확인해주세요.");
    }
  }, []);

  const fetchAIRecommendation = async (books) => {
    if (books.length === 0) return;
    const simplifiedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
      content: book.content,
    }));
    const currentMonth = new Date().getMonth() + 1;

    const prompt = `
    이번달은 ${currentMonth}달이야
    다음은 우리 도서관의 책 목록이야:
    ${JSON.stringify(simplifiedBooks)}
    
    이 중에서 이번 ${currentMonth}월의 계절감이나 분위기와 가장 잘 어울리는 추천작을 하나 골라줘.
    결과는 반드시 아래와 같은 순수 JSON 형태로만 응답해. 백틱(\`\`\`)이나 다른 설명은 절대 넣지 마.
    {"recommendedId": 숫자, "reason": "추천 이유"}
    `;
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
          }),
        },
      );
      const result = await response.json();
      const aiData = JSON.parse(result.choices[0].message.content);
      return aiData;
    } catch (error) {
      console.error("AI 추천 실패:", error);
    }
  };

  useEffect(() => {
    if (books.length > 0) {
      fetchAIRecommendation(books).then((result) => {
        if (result) {
          const recommendedBook = books.find(
            (b) => b.id === result.recommendedId,
          );
          setAiRecommendation({
            ...recommendedBook,
            reason: result.reason,
          });
        }
      });
    }
  }, [books]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadBooks();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadBooks]);

  useEffect(() => {
    if (!message) return undefined;

    const timerId = window.setTimeout(() => {
      setMessage("");
    }, 2200);

    return () => window.clearTimeout(timerId);
  }, [message]);

  const showToast = (text) => {
    setMessage("");
    window.setTimeout(() => {
      setMessage(text);
    }, 0);
  };

  const moveToStart = () => {
    setMessage("");
    setPage("start");
  };

  const moveToLogin = () => {
    setMessage("");
    setPage("login");
  };

  const moveToSignup = () => {
    setMessage("");
    setPage("signup");
  };

  const moveToList = () => {
    setListPage(1);
    setMessage("");
    setPage("list");
  };

  const moveBackToList = () => {
    setMessage("");
    setPage("list");
  };

  const moveToCreate = () => {
    if (!currentUser) {
      setMessage("로그인 후 새 도서를 등록할 수 있습니다.");
      setPage("login");
      return;
    }

    setMessage("");
    setPage("create");
  };

  const handleLogin = async (credentials) => {
    const nextAuth = await loginUser(credentials);

    saveAuth(nextAuth);
    setAuth(nextAuth);
    setMessage("로그인되었습니다.");
    setPage("start");
  };

  const handleSignup = async (formData) => {
    const nextAuth = await signupUser(formData);

    saveAuth(nextAuth);
    setAuth(nextAuth);
    setMessage("회원가입이 완료되었습니다.");
    setPage("start");
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setMessage("로그아웃되었습니다.");

    if (["create", "update", "coverUpdate"].includes(page)) {
      setPage("start");
    }
  };

  const moveToDetail = (book) => {
    setSelectedId(book.id);
    setMessage("");
    setPage("detail");
  };

  const moveToUpdate = (book) => {
    setSelectedId(book.id);
    setMessage("");
    setPage("update");
  };

  const moveToCoverUpdate = (book) => {
    setSelectedId(book.id);
    setMessage("");
    setPage("coverUpdate");
  };

  const handleCreateBook = async (formData) => {
    const now = new Date().toISOString();
    const authorName =
      currentUser?.nickname || currentUser?.name || currentUser?.userId || formData.author;
    const newBook = {
      ...formData,
      author: authorName,
      userId: currentUser?.userId,
      coverImageUrl: "",
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(newBook),
      });

      if (!res.ok) {
        throw new Error("도서 등록 실패");
      }

      const savedBook = await res.json();

      setBooks((prevBooks) => [...prevBooks, savedBook]);
      setSelectedId(savedBook.id);
      setMessage("새 도서를 등록했습니다.");
      setPage("detail");
    } catch (error) {
      console.error(error);
      setMessage("도서 등록 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateBook = async (book, formData) => {
    const updatedBook = {
      ...formData,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    try {
      const res = await fetch(`${API_URL}/${book.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(updatedBook),
      });

      if (!res.ok) {
        throw new Error("도서 수정 실패");
      }

      const savedBook = await res.json();

      setBooks((prevBooks) =>
        prevBooks.map((item) => (item.id === savedBook.id ? savedBook : item)),
      );
      setSelectedId(savedBook.id);
      setMessage("도서 정보를 수정했습니다.");
      setPage("detail");
    } catch (error) {
      console.error(error);
      setMessage("도서 수정 중 오류가 발생했습니다.");
    }
  };

  const handleLikeBook = async (book) => {
    if (!currentUser) {
      setMessage("로그인 후 추천할 수 있습니다.");
      setPage("login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${book.id}/like`, {
        method: "POST",
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("이미 추천한 도서입니다.");
        }
        throw new Error("도서 추천에 실패했습니다.");
      }

      const data = await res.json();

      setBooks((prevBooks) =>
        prevBooks.map((item) => (item.id === data.id ? data : item)),
      );
      setSelectedId(data.id);

      showToast(`${data.title} 도서를 추천했습니다.`);
      setPage("detail");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "도서 추천 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteBook = async (book) => {
    const isConfirm = window.confirm("선택한 도서를 삭제할까요?");

    if (!isConfirm) return;

    try {
      const res = await fetch(`${API_URL}/${book.id}`, {
        method: "DELETE",
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("도서 삭제 실패");
      }

      const nextBooks = books.filter((item) => item.id !== book.id);

      setBooks(nextBooks);
      setSelectedId(nextBooks[0]?.id ?? null);
      setMessage("도서를 삭제했습니다.");
      setPage("list");
    } catch (error) {
      console.error(error);
      setMessage("도서 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleGenerateCover = async ({ book, apiKey, model, quality }) => {
    const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations";

    const prompt = `

    다음 도서에 어울리는 책 표지 이미지를 생성해주세요.

    도서 제목: ${book.title}
    저자: ${book.author}
    출판사: ${book.publisher || ""}
    도서 내용: ${book.content}

    요구사항:
    - 세로형 책 표지 디자인
    - 깔끔하고 전문적인 분위기
    - 도서 내용과 어울리는 이미지 중심 디자인
    - 실제 서점에 있을 법한 표지 느낌
    - 글자는 너무 많이 넣지 않기
    `;

    try {
      setMessage("");

      const res = await fetch(OPENAI_IMAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          n: 1,
          size: "1024x1536",
          quality: quality,
          output_format: "png",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "OpenAI 요청 실패");
      }

      const b64Json = data.data?.[0]?.b64_json;

      if (!b64Json) {
        throw new Error("이미지 데이터가 응답에 없습니다.");
      }

      setMessage("");
      return `data:image/png;base64,${b64Json}`;
    } catch (error) {
      console.error(error);
      setMessage(error.message || "표지 생성 중 오류가 발생했습니다.");
      alert(error.message || "표지 생성 중 오류가 발생했습니다.");
    }
  };

  const handleSaveCoverImage = async (book, imageSrc) => {
    try {
      const res = await fetch(`${API_URL}/${book.id}/cover`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          coverImageUrl: imageSrc,
        }),
      });

      if (!res.ok) {
        throw new Error("표지 저장 실패");
      }

      const savedBook = await res.json();

      setBooks((prevBooks) =>
        prevBooks.map((item) => (item.id === savedBook.id ? savedBook : item)),
      );

      setSelectedId(savedBook.id);
      setMessage("");
      return savedBook;
    } catch (error) {
      console.error(error);
      setMessage(error.message || "표지 저장 중 오류가 발생했습니다.");
      alert(error.message || "표지 저장 중 오류가 발생했습니다.");
    }
  };

  const handleExtractTags = async (content, apiKey) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              '너는 도서 키워드 추출기야. 내용을 읽고 가장 중요한 키워드 3개를 #태그 형식의 JSON 배열로만 답해. 예: ["#로맨스", "#성장", "#현대물"]',
          },
          { role: "user", content: content },
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "태그 추출 실패");
    }

    const tagsArray = JSON.parse(data.choices[0].message.content.trim());
    return tagsArray.join(" "); // 결과물인 "#태그1 #태그2" 문자열만 반환
  };

  return (
    <div className="app">
      {message && <div className="message">{message}</div>}
      <Header
        onMoveToStart={moveToStart}
        aiRecommendation={aiRecommendation}
        page={page}
        currentUser={currentUser}
        onMoveToLogin={moveToLogin}
        onMoveToSignup={moveToSignup}
        onLogout={handleLogout}
      />
      {page === "start" && (
        <StartPage
          books={filteredBooks}
          newBooks={newBooks}
          popularBooks={popularBooks}
          onMoveToList={moveToList}
          onMoveToDetail={moveToDetail}
          onMoveToCreate={moveToCreate}
        />
      )}

      {page === "list" && (
        <BookList
          books={filteredBooks}
          search={search}
          onSearch={setSearch}
          type={type}
          onType={setType}
          currentPage={listPage}
          onPageChange={setListPage}
          onMoveToDetail={moveToDetail}
          onMoveToCreate={moveToCreate}
        />
      )}

      {page === "detail" && (
        <BookDetail
          book={selectedBook}
          onMoveToList={moveToList}
          onMoveBackToList={moveBackToList}
          onMoveToUpdate={moveToUpdate}
          onMoveToCoverUpdate={moveToCoverUpdate}
          onDelete={handleDeleteBook}
          onLikeBook={handleLikeBook}
          currentUser={currentUser}
        />
      )}

      {page === "create" && (
        <BookCreate
          onMoveToList={moveToList}
          onCreate={handleCreateBook}
          onExtractTags={handleExtractTags}
          currentUser={currentUser}
        />
      )}

      {page === "login" && (
        <AuthPage
          mode="login"
          onLogin={handleLogin}
          onSignup={handleSignup}
          onMoveToLogin={moveToLogin}
          onMoveToSignup={moveToSignup}
          onMoveToStart={moveToStart}
        />
      )}

      {page === "signup" && (
        <AuthPage
          mode="signup"
          onLogin={handleLogin}
          onSignup={handleSignup}
          onMoveToLogin={moveToLogin}
          onMoveToSignup={moveToSignup}
          onMoveToStart={moveToStart}
        />
      )}

      {page === "update" && (
        <BookUpdate
          book={selectedBook}
          onMoveToDetail={moveToDetail}
          onUpdate={handleUpdateBook}
          onExtractTags={handleExtractTags}
        />
      )}

      {page === "coverUpdate" && (
        <CoverUpdate
          book={selectedBook}
          onMoveToDetail={moveToDetail}
          onGenerateCover={handleGenerateCover}
          onSaveCoverImage={handleSaveCoverImage}
        />
      )}
    </div>
  );
}

export default App;
