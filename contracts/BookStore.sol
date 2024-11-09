// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";

contract BookStore is Ownable {
    struct Book {
        uint256 id;
        string title;
        uint256 price;
        address author;
        address seller;
        string pdfHash;
        uint256 royaltyPercentage;
        bool isActive;
        uint256 totalSales;
        uint256 createdAt;
    }

    struct Purchase {
        uint256 bookId;
        address buyer;
        uint256 price;
        uint256 purchaseDate;
    }

    struct Royalty {
        uint256 bookId;
        address author;
        uint256 amount;
        uint256 paymentDate;
    }

    uint256 private _nextBookId = 1;
    uint256 public platformFeePercentage = 5; // 5% platform fee

    mapping(uint256 => Book) public books;
    mapping(address => uint256[]) public authorBooks;
    mapping(address => uint256[]) public sellerBooks;
    mapping(address => mapping(uint256 => bool)) public userPurchases;
    mapping(uint256 => Purchase[]) public bookPurchases;
    mapping(address => Royalty[]) public authorRoyalties;

    event BookAdded(uint256 indexed bookId, string title, address indexed author, address indexed seller);
    event BookUpdated(uint256 indexed bookId, string title, uint256 price);
    event BookPurchased(uint256 indexed bookId, address indexed buyer, uint256 price);
    event RoyaltyPaid(uint256 indexed bookId, address indexed author, uint256 amount);
    event BookRemoved(uint256 indexed bookId);
    event PlatformFeeUpdated(uint256 newFeePercentage);

    modifier onlyBookOwner(uint256 bookId) {
        require(
            books[bookId].author == msg.sender || books[bookId].seller == msg.sender,
            "Not authorized"
        );
        _;
    }

    modifier bookExists(uint256 bookId) {
        require(books[bookId].isActive, "Book does not exist");
        _;
    }

    function addBook(
        string memory title,
        uint256 price,
        string memory pdfHash,
        uint256 royaltyPercentage
    ) public returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(royaltyPercentage <= 100, "Invalid royalty percentage");

        uint256 bookId = _nextBookId++;
        
        Book storage newBook = books[bookId];
        newBook.id = bookId;
        newBook.title = title;
        newBook.price = price;
        newBook.author = msg.sender;
        newBook.seller = msg.sender;
        newBook.pdfHash = pdfHash;
        newBook.royaltyPercentage = royaltyPercentage;
        newBook.isActive = true;
        newBook.createdAt = block.timestamp;

        authorBooks[msg.sender].push(bookId);
        sellerBooks[msg.sender].push(bookId);

        emit BookAdded(bookId, title, msg.sender, msg.sender);
        return bookId;
    }

    function updateBook(
        uint256 bookId,
        string memory title,
        uint256 price,
        string memory pdfHash,
        uint256 royaltyPercentage
    ) public bookExists(bookId) onlyBookOwner(bookId) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(royaltyPercentage <= 100, "Invalid royalty percentage");

        Book storage book = books[bookId];
        book.title = title;
        book.price = price;
        book.pdfHash = pdfHash;
        book.royaltyPercentage = royaltyPercentage;

        emit BookUpdated(bookId, title, price);
    }

    function purchaseBook(uint256 bookId) public payable bookExists(bookId) {
        Book storage book = books[bookId];
        require(!userPurchases[msg.sender][bookId], "Already purchased");
        require(msg.value == book.price, "Incorrect payment amount");

        uint256 platformFee = (msg.value * platformFeePercentage) / 100;
        uint256 royaltyAmount = (msg.value * book.royaltyPercentage) / 100;
        uint256 sellerAmount = msg.value - platformFee - royaltyAmount;

        // Transfer platform fee
        payable(owner()).transfer(platformFee);

        // Transfer royalty to author
        if (royaltyAmount > 0) {
            payable(book.author).transfer(royaltyAmount);
            authorRoyalties[book.author].push(Royalty({
                bookId: bookId,
                author: book.author,
                amount: royaltyAmount,
                paymentDate: block.timestamp
            }));
            emit RoyaltyPaid(bookId, book.author, royaltyAmount);
        }

        // Transfer remaining amount to seller
        payable(book.seller).transfer(sellerAmount);

        // Record purchase
        userPurchases[msg.sender][bookId] = true;
        bookPurchases[bookId].push(Purchase({
            bookId: bookId,
            buyer: msg.sender,
            price: msg.value,
            purchaseDate: block.timestamp
        }));

        book.totalSales++;

        emit BookPurchased(bookId, msg.sender, msg.value);
    }

    function removeBook(uint256 bookId) public bookExists(bookId) onlyBookOwner(bookId) {
        books[bookId].isActive = false;
        emit BookRemoved(bookId);
    }

    function setPlatformFee(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 20, "Fee too high"); // Max 20%
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }

    function getBookDetails(uint256 bookId) public view 
        returns (
            string memory title,
            uint256 price,
            address author,
            address seller,
            string memory pdfHash,
            uint256 royaltyPercentage,
            bool isActive,
            uint256 totalSales
        ) 
    {
        Book storage book = books[bookId];
        return (
            book.title,
            book.price,
            book.author,
            book.seller,
            book.pdfHash,
            book.royaltyPercentage,
            book.isActive,
            book.totalSales
        );
    }

    function getUserPurchases(address user) public view returns (uint256[] memory) {
        uint256 purchaseCount = 0;
        for (uint256 i = 1; i < _nextBookId; i++) {
            if (userPurchases[user][i]) {
                purchaseCount++;
            }
        }

        uint256[] memory userBooks = new uint256[](purchaseCount);
        uint256 index = 0;
        for (uint256 i = 1; i < _nextBookId; i++) {
            if (userPurchases[user][i]) {
                userBooks[index] = i;
                index++;
            }
        }
        return userBooks;
    }

    function getAuthorRoyalties(address author) public view returns (Royalty[] memory) {
        return authorRoyalties[author];
    }

    function getBookPurchases(uint256 bookId) public view returns (Purchase[] memory) {
        return bookPurchases[bookId];
    }

    function getAuthorBooks(address author) public view returns (uint256[] memory) {
        return authorBooks[author];
    }

    function getSellerBooks(address seller) public view returns (uint256[] memory) {
        return sellerBooks[seller];
    }

    // Emergency functions
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function emergencyPause(uint256 bookId) public onlyOwner bookExists(bookId) {
        books[bookId].isActive = false;
        emit BookRemoved(bookId);
    }
}