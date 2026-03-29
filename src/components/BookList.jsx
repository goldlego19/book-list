import BookCard from "./BookCard";

export default function BookList({ books, onDelete, onToggleRead }) {
  if (books.length === 0) {
    return (
      <p className="text-[#d496cf] mt-8 text-center text-lg font-medium">
        No books found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onDelete={onDelete}
          onToggleRead={onToggleRead}
        />
      ))}
    </div>
  );
}
