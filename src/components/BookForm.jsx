import { useState } from "react";

function BookForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitText,
  cancelClassName = "",
  onExtractTags,
  authorReadonly = false,
}) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  const handleShowApiKeyInput = () => {
    if (!formData.content?.trim()) {
      alert("도서 소개 내용을 먼저 입력해주세요.");
      return;
    }

    setShowApiKeyInput(true);
  };

  const handleTagClick = async () => {
    if (!apiKeyInput.trim()) {
      alert("OpenAI API 키를 입력해주세요.");
      return;
    }

    if (!formData.content?.trim()) {
      alert("도서 소개 내용을 먼저 입력해주세요.");
      return;
    }

    try {
      setIsExtracting(true);
      const extractedTags = await onExtractTags(formData.content, apiKeyInput);

      onChange({
        target: { name: "tags", value: extractedTags },
      });
      setShowApiKeyInput(false);
      alert("AI 태그가 성공적으로 추출되었습니다.");
    } catch (error) {
      console.error(error);
      alert("AI 태그 추출에 실패했습니다.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <form className="book-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label>도서 제목</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="도서 제목을 입력하세요"
        />
      </div>

      <div className="form-group">
        <label>저자</label>
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={onChange}
          readOnly={authorReadonly}
          placeholder="저자를 입력하세요"
        />
        {authorReadonly && (
          <p className="form-helper">로그인한 사용자 닉네임이 저자로 저장됩니다.</p>
        )}
      </div>

      <div className="form-group">
        <label>출판사</label>
        <input
          type="text"
          name="publisher"
          value={formData.publisher}
          onChange={onChange}
          placeholder="출판사를 입력하세요"
        />
      </div>

      <div className="form-group">
        <label>도서 소개</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={onChange}
          placeholder="도서 소개를 입력하세요"
        />

        {showApiKeyInput ? (
          <div className="inline-api-key-row">
            <input
              type="password"
              placeholder="OpenAI API 키"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            <button
              type="button"
              className="primary-btn"
              onClick={handleTagClick}
              disabled={isExtracting}
            >
              {isExtracting ? "분석 중..." : "실행"}
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowApiKeyInput(false)}
              disabled={isExtracting}
            >
              취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="tag-extract-button"
            onClick={handleShowApiKeyInput}
          >
            AI 태그 자동 추출
          </button>
        )}
      </div>

      <div className="form-group">
        <label>태그</label>
        <input
          type="text"
          name="tags"
          value={formData.tags || ""}
          onChange={onChange}
          placeholder="#태그 #형식으로 #입력"
        />
      </div>

      <div className="form-buttons">
        <button type="submit">{submitText}</button>
        <button type="button" className={cancelClassName} onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}

export default BookForm;

