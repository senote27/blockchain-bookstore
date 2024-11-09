// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookStore {
    struct Book {
        uint256 id;
        string title;
        address author;
        string pdfHash;
        string imageHash;
        uint256 price;
        uint256 royaltyPercentage;
        bool isAvailable;
    }

    mapping(uint256 => Book) public books;
    mapping(address => uint256[]) public authorBooks;
    mapping(address => uint256[]) public purchasedBooks;
    mapping(address => uint256) public authorRoyalties;
    
    uint256 public nextBookId = 1;
    
    event BookAdded(uint256 bookId, string title, address author);
    event BookPurchased(uint256 bookId, address buyer, uint256 price);
    event RoyaltyPaid(address author, uint256 amount);

    function addBook(
        string memory _title,
        string memory _pdfHash,
        string memory _imageHash,
        uint256 _price,
        address _author,
        uint256 _royaltyPercentage
    ) public returns (uint256) {
        require(_royaltyPercentage <= 100, "Royalty percentage must be <= 100");
        
        uint256 bookId = nextBookId++;
        
        books[bookId] = Book({
            id: bookId,
            title: _title,
            author: _author,
            pdfHash: _pdfHash,
            imageHash: _imageHash,
            price: _price,
            royaltyPercentage: _royaltyPercentage,
            isAvailable: true
        });
        
        authorBooks[_author].push(bookId);
        emit BookAdded(bookId, _title, _author);
        return bookId;
    }

    function buyBook(uint256 _bookId) public payable {
        Book storage book = books[_bookId];
        require(book.isAvailable, "Book is not available");
        require(msg.value >= book.price, "Insufficient payment");
        
        uint256 royaltyAmount = (msg.value * book.royaltyPercentage) / 100;
        authorRoyalties[book.author] += royaltyAmount;
        
        purchasedBooks[msg.sender].push(_bookId);
        payable(book.author).transfer(royaltyAmount);
        
        emit BookPurchased(_bookId, msg.sender, msg.value);
        emit RoyaltyPaid(book.author, royaltyAmount);
    }

    function getBook(uint256 _bookId) public view returns (Book memory) {
        return books[_bookId];
    }

    function getAllBooks() public view returns (Book[] memory) {
        Book[] memory allBooks = new Book[](nextBookId - 1);
        for (uint256 i = 1; i < nextBookId; i++) {
            allBooks[i - 1] = books[i];
        }
        return allBooks;
    }

    function getAuthorBooks(address _author) public view returns (Book[] memory) {
        uint256[] storage authorBookIds = authorBooks[_author];
        Book[] memory authorBooksList = new Book[](authorBookIds.length);
        
        for (uint256 i = 0; i < authorBookIds.length; i++) {
            authorBooksList[i] = books[authorBookIds[i]];
        }
        return authorBooksList;
    }

    function getPurchasedBooks(address _buyer) public view returns (Book[] memory) {
        uint256[] storage purchasedBookIds = purchasedBooks[_buyer];
        Book[] memory purchasedBooksList = new Book[](purchasedBookIds.length);
        
        for (uint256 i = 0; i < purchasedBookIds.length; i++) {
            purchasedBooksList[i] = books[purchasedBookIds[i]];
        }
        return purchasedBooksList;
    }

    function getAuthorRoyalties(address _author) public view returns (uint256) {
        return authorRoyalties[_author];
    }
}