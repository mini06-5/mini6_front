import { useState } from "react";
import BookForm from "../components/BookForm";

function BookUpdate({ book, onMoveToDetail, onUpdate, onExtractTags, currentUser }) {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author?.nickname || "",
    publisher: book?.publisher || "",
    content: book?.content || "",
    tags: book?.tags || "",
  });

  if (!book) {
    return (
      <>
        <main className="form-page">
          <p>수정할 도서 정보가 없습니다.</p>
        </main>
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author?.trim()) {
      alert("도서 제목과 저자는 필수입니다.");
      return;
    }

    const submitData = {
      title: formData.title,
      publisher: formData.publisher,
      content: formData.content,
      tags: formData.tags,
      author: {
        userId: book?.author?.userId
      }
    };

    onUpdate(book, submitData);
  };

  return (
    <>
      <main className="form-page">
        <section className="section-card form-card">
          <h2>등록된 도서 수정</h2>

          <BookForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => onMoveToDetail(book)}
            submitText="수정하기"
            cancelClassName="danger-button"
            onExtractTags={onExtractTags}
            authorReadonly={Boolean(currentUser)}
          />
        </section>
      </main>
    </>
  );
}

export default BookUpdate;
