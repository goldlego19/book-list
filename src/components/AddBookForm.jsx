import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";

export default function AddBookForm({ onClose }) {
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  // NEW: State for the location, defaulting to 'Home'
  const [location, setLocation] = useState("Home");
  const [isSearching, setIsSearching] = useState(false);

  const fetchCoverImage = async (title, author) => {
    try {
      const query = new URLSearchParams({ title, author }).toString();
      const response = await fetch(
        `https://openlibrary.org/search.json?${query}`,
      );
      const data = await response.json();
      if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
        return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`;
      }
      return "https://via.placeholder.com/128x192.png?text=No+Cover";
    } catch (error) {
      return "https://via.placeholder.com/128x192.png?text=Error";
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newTitle || !newAuthor) return;

    setIsSearching(true);
    try {
      const coverUrl = await fetchCoverImage(newTitle, newAuthor);
      const booksCollectionRef = collection(db, "books");
      // inside handleAddBook...
      await addDoc(booksCollectionRef, {
        title: newTitle,
        author: newAuthor,
        coverUrl: coverUrl,
        location: location,
        isRead: false, // NEW: Default to unread
      });

      setNewTitle("");
      setNewAuthor("");
      setLocation("Home"); // Reset to default
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
      // ADDED: w-[95%], max-h-[85vh], and overflow-y-auto to handle the iOS keyboard safely
      className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl w-[95%] max-w-md max-h-[85vh] overflow-y-auto relative"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-pink-300 hover:text-pink-500 transition-colors text-xl"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold text-[#d496cf] mb-6">Add a New Book</h2>

      <form onSubmit={handleAddBook} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Book Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isSearching}
          className="border border-pink-100 bg-pink-50/30 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white transition-all disabled:opacity-50 text-slate-700"
        />
        <input
          type="text"
          placeholder="Author"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          disabled={isSearching}
          className="border border-pink-100 bg-pink-50/30 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white transition-all disabled:opacity-50 text-slate-700"
        />

        {/* NEW: Location Dropdown */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSearching}
          className="border border-pink-100 bg-pink-50/30 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white transition-all disabled:opacity-50 text-slate-700 cursor-pointer appearance-none"
        >
          <option value="Home">Home</option>
          <option value="Denzel">Denzel</option>
        </select>

        <button
          type="submit"
          disabled={isSearching}
          className="bg-[#d496cf] text-white font-semibold px-6 py-4 rounded-xl hover:bg-[#c485bf] transition-colors disabled:opacity-70 mt-2 shadow-sm"
        >
          {isSearching ? "Searching for cover..." : "Add to Collection"}
        </button>
      </form>
    </motion.div>
  );
}
