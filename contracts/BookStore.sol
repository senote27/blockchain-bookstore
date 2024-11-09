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

    struct RoyaltyInfo {
        uint256 totalRoyalties;
        uint256 totalSales;
        mapping(uint256 => uint256) bookRoyalties; // bookId => royalties earned
    }

    mapping(uint256 => Book) public books;
    mapping(address => uint256[]) public authorBooks;
    mapping(address => uint256[]) public purchasedBooks;
    mapping(address => RoyaltyInfo) private royalties;
    
    uint256 public nextBookId = 1;
    
    event BookAdded(uint256 bookId, string title, address author, uint256 price, uint256 royaltyPercentage);
    event BookPurchased(uint256 bookId, address buyer, uint256 price, uint256 royaltyPaid);
    event RoyaltyPaid(address author, uint256 bookId, uint256 amount);
    event RoyaltyClaimed(address author, uint256 amount);

    modifier onlyBookAuthor(uint256 bookId) {
        require(books[bookId].author == msg.sender, "Only book author can perform this action");
        _;
    }

    function addBook(
        string memory _title,
        string memory _pdfHash,
        string memory _imageHash,
        uint256 _price,
        uint256 _royaltyPercentage
    ) public returns (uint256) {
        require(_royaltyPercentage <= 100, "Royalty percentage must be between 0 and 100");
        require(_price > 0, "Price must be greater than 0");
        
        uint256 bookId = nextBookId++;
        books[bookId] = Book(
            bookId,
            _title,
            msg.sender,
            _pdfHash,
            _imageHash,
            _price,
            _royaltyPercentage,
            true
        );
        
        authorBooks[msg.sender].push(bookId);
        
        emit BookAdded(bookId, _title, msg.sender, _price, _royaltyPercentage);
        return bookId;
    }

    function buyBook(uint256 _bookId) public payable {
        Book storage book = books[_bookId];
        require(book.isAvailable, "Book not available");
        require(msg.value >= book.price, "Insufficient payment");
        require(book.author != msg.sender, "Author cannot buy their own book");
        
        uint256 royaltyAmount = (msg.value * book.royaltyPercentage) / 100;
        
        // Update royalty tracking
        RoyaltyInfo storage authorRoyalties = royalties[book.author];
        authorRoyalties.totalRoyalties += royaltyAmount;
        authorRoyalties.totalSales++;
        authorRoyalties.bookRoyalties[_bookId] += royaltyAmount;
        
        // Transfer royalty to author
        (bool sent, ) = payable(book.author).call{value: royaltyAmount}("");
        require(sent, "Failed to send royalty to author");
        
        purchasedBooks[msg.sender].push(_bookId);
        
        emit BookPurchased(_bookId, msg.sender, msg.value, royaltyAmount);
        emit RoyaltyPaid(book.author, _bookId, royaltyAmount);
    }

    function getAuthorRoyalties(address _author) public view returns (uint256) {
        return royalties[_author].totalRoyalties;
    }

    function getBookRoyalties(uint256 _bookId) public view onlyBookAuthor(_bookId) returns (uint256) {
        return royalties[msg.sender].bookRoyalties[_bookId];
    }

    function getAuthorTotalSales(address _author) public view returns (uint256) {
        return royalties[_author].totalSales;
    }

    function getBook(uint256 _bookId) public view returns (
        uint256 id,
        string memory title,
        address author,
        string memory pdfHash,
        string memory imageHash,
        uint256 price,
        uint256 royaltyPercentage,
        bool isAvailable
    ) {
        Book storage book = books[_bookId];
        return (
            book.id,
            book.title,
            book.author,
            book.pdfHash,
            book.imageHash,
            book.price,
            book.royaltyPercentage,
            book.isAvailable
        );
    }

    function getAuthorBooks() public view returns (uint256[] memory) {
        return authorBooks[msg.sender];
    }

    function getPurchasedBooks() public view returns (uint256[] memory) {
        return purchasedBooks[msg.sender];
    }

    function updateBookPrice(uint256 _bookId, uint256 _newPrice) public onlyBookAuthor(_bookId) {
        require(_newPrice > 0, "Price must be greater than 0");
        books[_bookId].price = _newPrice;
    }

    function updateRoyaltyPercentage(uint256 _bookId, uint256 _newPercentage) public onlyBookAuthor(_bookId) {
        require(_newPercentage <= 100, "Royalty percentage must be between 0 and 100");
        books[_bookId].royaltyPercentage = _newPercentage;
    }

    function toggleBookAvailability(uint256 _bookId) public onlyBookAuthor(_bookId) {
        books[_bookId].isAvailable = !books[_bookId].isAvailable;
    }
}