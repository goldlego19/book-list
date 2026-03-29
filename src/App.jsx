import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, provider } from "./firebase";
import { motion, AnimatePresence } from "framer-motion";
import AddBookForm from "./components/AddBookForm";
import BookList from "./components/BookList";

function App() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("All");
  // NEW: State for sorting
  const [sortBy, setSortBy] = useState("title");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser),
    );
    return () => unsubscribeAuth();
  }, []);

  const handleDeleteBook = async (id) => {
    if (window.confirm("Remove this book from your garden?")) {
      setIsProcessing(id);
      try {
        const bookDoc = doc(db, "books", id);
        await deleteDoc(bookDoc);
      } catch (error) {
        console.error(error);
      } finally {
        setIsProcessing(null);
      }
    }
  };

  const handleToggleRead = async (id, currentStatus) => {
    setIsProcessing(id);
    try {
      const bookDoc = doc(db, "books", id);
      await updateDoc(bookDoc, { isRead: !currentStatus });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    const booksCollectionRef = collection(db, "books");
    const unsubscribeDb = onSnapshot(booksCollectionRef, (snapshot) => {
      const booksData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setBooks(booksData);
    });
    return () => unsubscribeDb();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const uniqueAuthors = useMemo(() => {
    const authors = books.map((book) => book.author);
    return ["All", ...new Set(authors)];
  }, [books]);

  // UPDATED: Filter AND Sort the books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesSearch = book.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesAuthor =
          selectedAuthor === "All" || book.author === selectedAuthor;
        return matchesSearch && matchesAuthor;
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        } else {
          return a.author.localeCompare(b.author);
        }
      });
  }, [books, searchQuery, selectedAuthor, sortBy]);

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-20 font-sans relative overflow-hidden garden-background-wrapper">
      <div className="max-w-7xl w-full mx-auto relative z-10">
        <div className="flex flex-row justify-between items-start gap-4 mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-5xl text-left text-white drop-shadow-sm font-['Leckerli_One'] tracking-tight sm:tracking-wide [-webkit-text-stroke:1px_black] leading-tight max-w-[150px] sm:max-w-none">
            My Library
          </h1>

          {user ? (
            <div className="flex flex-row flex-wrap justify-end gap-2 sm:gap-4 max-w-[180px] sm:max-w-none">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-[#d496cf] text-[10px] sm:text-base font-bold px-3 sm:px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
              >
                + Add Book
              </button>

              <button
                onClick={handleSignOut}
                className="bg-white text-[#d496cf] text-[10px] sm:text-base font-bold px-3 sm:px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-white text-[#d496cf] font-bold px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-4 sm:p-8 shadow-xl border border-white/50 min-h-[500px]">
          {books.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-pink-100">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-pink-100 bg-pink-50/30 rounded-xl p-3 outline-none focus:border-pink-300 focus:bg-white transition-all text-slate-700 w-full"
              />

              {/* Filter Group for Mobile side-by-side */}
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="flex-1 sm:w-64 border border-pink-100 bg-pink-50/30 rounded-xl p-3 outline-none focus:border-pink-300 focus:bg-white transition-all text-slate-700 cursor-pointer appearance-none"
                >
                  {uniqueAuthors.map((author) => (
                    <option key={author} value={author}>
                      {author === "All" ? "All Authors" : author}
                    </option>
                  ))}
                </select>

                {/* NEW: Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:w-40 border border-pink-100 bg-pink-50/30 rounded-xl p-3 outline-none focus:border-pink-300 focus:bg-white transition-all text-slate-700 cursor-pointer appearance-none font-medium"
                >
                  <option value="title">Sort: Title</option>
                  <option value="author">Sort: Author</option>
                </select>
              </div>
            </div>
          )}

          <BookList
            books={filteredBooks}
            onDelete={handleDeleteBook}
            onToggleRead={handleToggleRead}
            processingId={isProcessing}
          />
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
            />
            <AddBookForm onClose={() => setIsModalOpen(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
