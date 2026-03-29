import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";

export default function AddBookForm({ onClose }) {
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [location, setLocation] = useState("Home");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCover, setSelectedCover] = useState(null);

  // FETCH MULTIPLE COVERS
  const searchCovers = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    setIsSearching(true);
    try {
      const query = encodeURIComponent(`${newTitle} ${newAuthor}`);

      // 1. Prepare Open Library Search
      const olPromise = fetch(
        `https://openlibrary.org/search.json?title=${query}`,
      )
        .then((res) => res.json())
        .then((data) =>
          (data.docs || [])
            .filter((doc) => doc.cover_i)
            .slice(0, 5)
            .map((doc) => ({
              id: `ol-${doc.cover_i}`,
              url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
            })),
        )
        .catch(() => []);

      // 2. Prepare Google Books Search
      const googlePromise = fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyBbqKR57x6Y0E43Q_mC-3psMZ_EzFRWJx8`,
      )
        .then((res) => res.json())
        .then((data) =>
          (data.items || [])
            .filter((item) => item.volumeInfo.imageLinks?.thumbnail)
            .slice(0, 5)
            .map((item) => ({
              id: `gb-${item.id}`,
              // Replace http with https for security and zoom=1 for better iPhone quality
              url:
                item.volumeInfo.imageLinks.thumbnail.replace(
                  "http:",
                  "https:",
                ) + "&zoom=1",
            })),
        )
        .catch(() => []);

      // 3. Combine both outputs into one list
      const [olResults, googleResults] = await Promise.all([
        olPromise,
        googlePromise,
      ]);
      const combined = [...googleResults, ...olResults];

      setSearchResults(combined);

      // Auto-select the very first one found as the default
      if (combined.length > 0) {
        setSelectedCover(combined[0].url);
      } else {
        setSelectedCover(
          "https://via.placeholder.com/128x192.png?text=No+Cover",
        );
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newTitle || !newAuthor) return;

    setIsSearching(true);
    try {
      const booksCollectionRef = collection(db, "books");

      await addDoc(booksCollectionRef, {
        title: newTitle,
        author: newAuthor,
        // Use the cover we selected from the list
        coverUrl:
          selectedCover ||
          "https://via.placeholder.com/128x192.png?text=No+Cover",
        location: location,
        isRead: false,
      });

      setNewTitle("");
      setNewAuthor("");
      setLocation("Home");
      onClose();
    } catch (error) {
      console.error("Error adding book: ", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl w-[95%] max-w-md max-h-[85vh] overflow-y-auto relative"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-pink-300 hover:text-pink-500 text-xl"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-[#d496cf] mb-6">Add a New Book</h2>

      <div className="flex flex-col gap-4">
        {/* INPUTS */}
        <input
          type="text"
          placeholder="Book Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border border-pink-100 bg-pink-50/30 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white text-slate-700"
        />
        <input
          type="text"
          placeholder="Author"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          className="border border-pink-100 bg-pink-50/30 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white text-slate-700"
        />

        {/* SEARCH BUTTON */}
        <button
          onClick={searchCovers}
          disabled={isSearching || !newTitle}
          className="bg-pink-100 text-[#d496cf] font-bold py-2 rounded-xl hover:bg-pink-200 transition-all text-sm disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Search for Covers"}
        </button>

        {/* COVER SELECTION AREA */}
        {searchResults.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-bold text-pink-400 uppercase mb-2 tracking-widest">
              Select Edition:
            </p>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x scrollbar-hide">
              {searchResults.map((result) => (
                <img
                  key={result.id}
                  src={result.url}
                  onClick={() => setSelectedCover(result.url)}
                  className={`h-28 w-20 object-cover rounded-lg cursor-pointer transition-all snap-start shrink-0 border-4
                    ${selectedCover === result.url ? "border-pink-400 scale-105 shadow-md" : "border-transparent opacity-60"}`}
                />
              ))}
            </div>
          </div>
        )}

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border border-pink-100 bg-pink-50/30 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white text-slate-700 cursor-pointer appearance-none"
        >
          <option value="Home">Home</option>
          <option value="Denzel">Denzel</option>
        </select>

        <button
          onClick={handleAddBook}
          disabled={isSearching || !selectedCover}
          className="bg-[#d496cf] text-white font-semibold px-6 py-4 rounded-xl hover:bg-[#c485bf] transition-colors disabled:opacity-70 mt-2 shadow-sm"
        >
          Add to Collection
        </button>
      </div>
    </motion.div>
  );
}
