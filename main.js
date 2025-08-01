class Observable {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(...args));
    }
  }
}

class Book {
  constructor(title, author, pages, read) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
  }
}

class LibraryModel extends Observable {
  constructor() {
    super();
    this.books = [];
  }

  addBook(book) {
    this.books.push(book);
    this.emit("libraryUpdated", this.books);
  }

  removeBook(bookId) {
    this.books = this.books.filter((book) => book.id !== bookId);
    this.emit("libraryUpdated", this.books);
  }

  updateReadStatus(bookId, readStatus) {
    const book = this.books.find((b) => b.id === bookId);
    if (book) {
      book.read = readStatus;
      this.emit("libraryUpdated", this.books);
    }
  }

  getStats() {
    const totalBooks = this.books.length;
    const booksRead = this.books.filter((book) => book.read).length;
    const totalPages = this.books.reduce((sum, book) => sum + book.pages, 0);
    const pagesRead = this.books.reduce(
      (sum, book) => (book.read ? sum + book.pages : sum),
      0
    );

    return { totalBooks, booksRead, totalPages, pagesRead };
  }
}

class LibraryView {
  constructor() {
    this.cardGrid = document.getElementById("card-grid");
    this.dialog = document.getElementById("new-book-dialog");
    this.form = this.dialog.querySelector("form");
    this.newBookButton = document.getElementById("new-book");
    this.closeDialogButton = this.dialog.querySelector(".exit-modal-icon");
    this.statsElements = {
      booksRead: document.getElementById("books-read"),
      totalBooks: document.getElementById("total-books"),
      pagesRead: document.getElementById("pages-read"),
      totalPages: document.getElementById("total-pages"),
    };

    this.renderedBooks = new Map();
  }

  bindAddBook(handler) {
    this.newBookButton.addEventListener("click", () => this.dialog.showModal());

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.form.checkValidity()) {
        const formData = new FormData(this.form);
        handler({
          title: formData.get("book-title"),
          author: formData.get("book-author"),
          pages: parseInt(formData.get("book-pages")),
          read: formData.get("book-read"),
        });
        this.form.reset();
        this.dialog.close();
      }
    });
  }

  bindDialogClose() {
    this.closeDialogButton.addEventListener("click", () => {
      this.form.reset();
      this.dialog.close();
    });
  }

  bindRemoveBook(handler) {
    this.cardGrid.addEventListener("click", (e) => {
      if (e.target.closest(".remove-button")) {
        const card = e.target.closest(".card");
        handler(card.dataset.id);
      }
    });
  }

  bindUpdateReadStatus(handler) {
    this.cardGrid.addEventListener("change", (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        const card = e.target.closest(".card");
        handler(card.dataset.id, e.target.checked);
      }
    });
  }

  renderBooks(books) {
    const currentBookIds = new Set(books.map((book) => book.id));
    const renderedBookIds = new Set(this.renderedBooks.keys());

    for (const bookId of renderedBookIds) {
      if (!currentBookIds.has(bookId)) {
        this.removeBookCard(bookId);
      }
    }

    books.forEach((book) => {
      const existingBook = this.renderedBooks.get(book.id);

      if (!existingBook) {
        this.addBookCard(book);
      } else if (this.hasBookChanged(existingBook, book)) {
        this.updateBookCard(book);
      }
    });
  }

  hasBookChanged(oldBook, newBook) {
    return (
      oldBook.title !== newBook.title ||
      oldBook.author !== newBook.author ||
      oldBook.pages !== newBook.pages ||
      oldBook.read !== newBook.read
    );
  }

  addBookCard(book) {
    const card = this.createBookCard(book);
    this.cardGrid.appendChild(card);
    this.renderedBooks.set(book.id, { ...book });
  }

  removeBookCard(bookId) {
    const card = this.cardGrid.querySelector(`[data-id="${bookId}"]`);
    if (card) {
      card.remove();
      this.renderedBooks.delete(bookId);
    }
  }

  updateBookCard(book) {
    const card = this.cardGrid.querySelector(`[data-id="${book.id}"]`);
    if (!card) return;

    const existingBook = this.renderedBooks.get(book.id);

    if (existingBook.title !== book.title) {
      const titleElement = card.querySelector("h3");
      titleElement.textContent = book.title.toUpperCase();
    }

    if (existingBook.author !== book.author) {
      const authorElement = card.querySelector("p");
      authorElement.textContent = book.author;
    }

    if (existingBook.pages !== book.pages) {
      const pagesElement = card.querySelector(".book-stats span");
      pagesElement.textContent = `${book.pages} PAGES`;
    }

    if (existingBook.read !== book.read) {
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.checked = book.read;
    }

    this.renderedBooks.set(book.id, { ...book });
  }

  createBookCard(book) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = book.id;

    const topRow = document.createElement("div");
    topRow.className = "card-top-row";

    const textContainer = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = book.title.toUpperCase();
    const author = document.createElement("p");
    author.textContent = book.author;

    textContainer.appendChild(title);
    textContainer.appendChild(author);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("icon", "x-icon", "remove-card-icon", "remove-button");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("role", "button");
    svg.setAttribute("aria-label", "Remove book");
    svg.setAttribute("tabindex", "0");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M5.1716 8.00003L1.08582 3.91424L3.91424 1.08582L8.00003 5.1716L12.0858 1.08582L14.9142 3.91424L10.8285 8.00003L14.9142 12.0858L12.0858 14.9142L8.00003 10.8285L3.91424 14.9142L1.08582 12.0858L5.1716 8.00003Z"
    );

    svg.appendChild(path);
    topRow.appendChild(textContainer);
    topRow.appendChild(svg);

    const bookStats = document.createElement("div");
    bookStats.className = "book-stats";

    const pages = document.createElement("span");
    pages.textContent = `${book.pages} PAGES`;

    const readStatus = document.createElement("div");
    readStatus.className = "read-status";

    const label = document.createElement("label");
    label.htmlFor = `read-status-${book.id}`;
    const labelText = document.createElement("span");
    labelText.textContent = "READ";
    label.appendChild(labelText);

    const checkbox = document.createElement("input");
    checkbox.id = `read-status-${book.id}`;
    checkbox.type = "checkbox";
    checkbox.name = "read-status";
    checkbox.checked = book.read;

    readStatus.appendChild(label);
    readStatus.appendChild(checkbox);
    bookStats.appendChild(pages);
    bookStats.appendChild(readStatus);

    card.appendChild(topRow);
    card.appendChild(bookStats);

    return card;
  }

  updateStats(stats) {
    Object.entries(stats).forEach(([key, value]) => {
      if (this.statsElements[key].textContent !== value.toString()) {
        this.statsElements[key].textContent = value;
      }
    });
  }
}

class LibraryController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Bind view events to model actions
    this.view.bindAddBook(this.handleAddBook.bind(this));
    this.view.bindDialogClose();
    this.view.bindRemoveBook(this.handleRemoveBook.bind(this));
    this.view.bindUpdateReadStatus(this.handleUpdateReadStatus.bind(this));

    // React to model changes
    this.model.on("libraryUpdated", (books) => {
      this.view.renderBooks(books);
      this.view.updateStats(this.model.getStats());
    });

    this.loadSampleData();
  }

  handleAddBook(bookData) {
    const book = new Book(
      bookData.title,
      bookData.author,
      bookData.pages,
      bookData.read
    );
    this.model.addBook(book);
  }

  handleRemoveBook(bookId) {
    this.model.removeBook(bookId);
  }

  handleUpdateReadStatus(bookId, readStatus) {
    this.model.updateReadStatus(bookId, readStatus);
  }

  loadSampleData() {
    const sampleBooks = [
      new Book("Vertical Leap for Dummies", "Dr. Air Jordan", 290, true),
      new Book(
        "Crying in My Championship Champagne",
        'Michael "Air Soreness" Jordan',
        412,
        false
      ),
      new Book("I Promise School Lunch Recipes", "Chef LeBron", 310, true),
      new Book(
        "Space Jam 3: Revenge of the Monstars",
        "Warner Bros. Ghostwriter",
        476,
        true
      ),
      new Book(
        "How to Dunk on Feelings: Emotional Alley-Oops",
        "Dr. Phil Jackson",
        304,
        false
      ),
      new Book("The Taco Tuesday Manifesto", 'Taco "Tuesday" James', 271, true),
      new Book(
        "Hairline Management for Champions",
        "Dr. Transplant",
        255,
        true
      ),
      new Book("The GOAT Debate: Why Bron > MJ", "King James Press", 311, true),
    ];

    sampleBooks.forEach((book) => this.model.addBook(book));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const model = new LibraryModel();
  const view = new LibraryView();
  new LibraryController(model, view);
});
