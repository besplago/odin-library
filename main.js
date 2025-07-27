const myLibrary = []

class Book {
  constructor (title, author, pages, read) {
    this.id = crypto.randomUUID()
    this.title = title
    this.author = author
    this.pages = pages
    this.read = read
  }
}

function addBookToLibrary (title, author, pages, read) {
  const newBook = new Book(title, author, pages, read)
  myLibrary.push(newBook)
}

function removeBookFromLibrary (bookId) {}

function createBookCard (book) {
  const card = document.createElement('div')
  card.className = 'card'

  card.dataset.id = book.id

  const topRow = document.createElement('div')
  topRow.className = 'card-top-row'

  const textContainer = document.createElement('div')
  const title = document.createElement('h3')
  title.textContent = book.title.toUpperCase()
  const author = document.createElement('p')
  author.textContent = book.author

  textContainer.appendChild(title)
  textContainer.appendChild(author)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.classList.add('remove-card-icon')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute(
    'd',
    'M5.1716 8.00003L1.08582 3.91424L3.91424 1.08582L8.00003 5.1716L12.0858 1.08582L14.9142 3.91424L10.8285 8.00003L14.9142 12.0858L12.0858 14.9142L8.00003 10.8285L3.91424 14.9142L1.08582 12.0858L5.1716 8.00003Z'
  )

  svg.appendChild(path)

  svg.addEventListener('click', () => card.remove())
  // Remove also from myLibrary

  topRow.appendChild(textContainer)
  topRow.appendChild(svg)

  const bookStats = document.createElement('div')
  bookStats.className = 'book-stats'

  const pages = document.createElement('h4')
  pages.textContent = `${book.pages} PAGES`

  const readStatus = document.createElement('div')
  readStatus.className = 'read-status'

  const label = document.createElement('label')
  const labelText = document.createElement('h4')
  labelText.textContent = 'READ'
  label.appendChild(labelText)

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.name = 'read-status'

  readStatus.appendChild(label)
  readStatus.appendChild(checkbox)

  bookStats.appendChild(pages)
  bookStats.appendChild(readStatus)

  card.appendChild(topRow)
  card.appendChild(bookStats)

  return card
}

function displayBooks (library) {
  const cardGrid = document.getElementById('card-grid')
  library.forEach(book => {
    cardGrid.appendChild(createBookCard(book))
  })
}

addBookToLibrary('Three Body Problem', 'Cixin Liu', 290, true)
addBookToLibrary('Dune', 'Frank Herbert', 412, true)
addBookToLibrary('The Hobbit', 'J.R.R. Tolkien', 310, false)
addBookToLibrary('Project Hail Mary', 'Andy Weir', 476, true)
addBookToLibrary('The Left Hand of Darkness', 'Ursula K. Le Guin', 304, true)
addBookToLibrary('Neuromancer', 'William Gibson', 271, false)

console.log(myLibrary)

displayBooks(myLibrary)
