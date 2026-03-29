import { motion } from "framer-motion";
import { auth } from "../firebase";

// Added isProcessing prop here
export default function BookCard({
  book,
  onDelete,
  onToggleRead,
  isProcessing,
}) {
  const coverImage =
    book.coverUrl || "https://via.placeholder.com/128x192.png?text=No+Cover";
  const isLoggedIn = !!auth.currentUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col h-full p-2 transition-all duration-500 bg-white border-2 shadow-sm sm:p-3 rounded-2xl group
        ${
          book.isRead
            ? "border-pink-300 shadow-[0_0_15px_rgba(242,206,239,0.5)] opacity-90"
            : "border-pink-50 shadow-sm"
        }`}
    >
      {/* Action Buttons Layer */}
      <div
        className={`absolute flex flex-col gap-2 z-30 top-3 right-3 transition-opacity duration-300
        ${isLoggedIn ? "opacity-100 sm:opacity-0 sm:group-hover:opacity-100" : "hidden"}`}
      >
        {/* If this specific book is being processed, show a spinner instead of buttons */}
        {isProcessing ? (
          <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
            <div className="w-4 h-4 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* DELETE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(book.id);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm text-pink-300 hover:text-red-500 rounded-full shadow-md active:scale-90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            {/* READ TOGGLE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleRead(book.id, book.isRead);
              }}
              className={`p-2 rounded-full shadow-md transition-all active:scale-90 ${book.isRead ? "bg-pink-400 text-white" : "bg-white/90 text-pink-300"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill={book.isRead ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Book Cover Container */}
      <div className="relative flex-shrink-0 w-full overflow-hidden shadow-sm aspect-[2/3] rounded-xl bg-pink-50">
        <img
          src={coverImage}
          className={`w-full h-full object-cover transition-all duration-700 
            ${book.isRead ? "grayscale-[0.4] sepia-[0.2] brightness-90" : "group-hover:scale-105"}
            ${isProcessing ? "blur-[2px] opacity-50" : ""}`} // Blur image while loading
          alt={book.title}
        />

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] z-10">
            <div className="w-8 h-8 border-4 border-pink-100 border-t-pink-400 rounded-full animate-spin"></div>
          </div>
        )}

        {/* "READ" Ribbon Overlay */}
        {book.isRead && !isProcessing && (
          <div className="absolute top-0 left-0 z-10 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase bg-pink-400 rounded-br-lg shadow-md">
            Finished
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="flex flex-col flex-1 w-full px-1 pb-1 mt-3 text-left">
        <h2
          className={`text-sm sm:text-base font-bold leading-tight mb-0.5 line-clamp-2 transition-colors duration-500
          ${book.isRead ? "text-pink-400 italic" : "text-slate-800"}`}
        >
          {book.title}
        </h2>
        <p className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium italic">
          {book.author}
        </p>

        <div className="flex flex-wrap gap-1 mt-auto">
          {book.location && (
            <span
              className={`text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border
              ${book.isRead ? "bg-pink-50 text-pink-300 border-pink-200" : "bg-pink-100 text-[#d496cf] border-transparent"}`}
            >
              {book.location}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
