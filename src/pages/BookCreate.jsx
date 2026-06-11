import { useState } from "react";
import BookForm from "../components/BookForm";

const getAuthorName = (user) => user?.nickname || user?.name || user?.userId || "";

function BookCreate({ onMoveToList, onCreate, onExtractTags, currentUser }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    content: "",
    tags: "",
  });

  const formDataWithAuthor = {
    ...formData,
    author: getAuthorName(currentUser),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formDataWithAuthor.author.trim()) {
      alert("도서 제목과 저자는 필수입니다.");
      return;
    }

    const submitData = {
      ...formData,
      author: {
        userId: currentUser?.userId,
      },
    };

    onCreate(submitData);
  };

  return (
    <main className="form-page">
      <section className="section-card form-card">
        <h2>새 도서 등록</h2>

        <BookForm
          formData={formDataWithAuthor}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={onMoveToList}
          onExtractTags={onExtractTags}
          submitText="등록하기"
          authorReadonly={Boolean(currentUser)}
        />
      </section>
    </main>
  );
}

export default BookCreate;

