// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookStore {
    address public owner;
    
    struct Book {
        uint256 id;
        string title;
        string pdfHash;
        string imageHash;
        uint256 price;
        address payable author;
        uint256 royaltyPercentage;
        bool isActive;
    }
    
    mapping(address => bool) public authorizedSellers;
    mapping(address => bool) public authorizedAuthors;
    mapping(uint256 => Book) public books;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256) public authorRoyalties;
    
    uint256 public bookCount;
    
    event BookAdded(uint256 bookId, string title, address author);
    event BookPurchased(uint256 bookId, address buyer, uint256 price);
    event RoyaltyPaid(address author, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        authorizedSellers[msg.sender] = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlySeller() {
        require(authorizedSellers[msg.sender], "Only authorized sellers can perform this action");
        _;
    }
    
    modifier onlyAuthor() {
        require(authorizedAuthors[msg.sender], "Only authorized authors can perform this action");
        _;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
    
    function addSeller(address seller) public onlyOwner {
        authorizedSellers[seller] = true;
    }
    
    function addAuthor(address author) public onlyOwner {
        authorizedAuthors[author] = true;
    }
    
    function addBook(
        string memory title,
        string memory pdfHash,
        string memory imageHash,
        uint256 price,
        address payable author,
        uint256 royaltyPercentage
    ) public onlySeller returns (uint256) {
        require(royaltyPercentage <= 100, "Invalid royalty percentage");
        require(authorizedAuthors[author], "Invalid author address");
        
        bookCount++;
        books[bookCount] = Book(
            bookCount,
            title,
            pdfHash,
            imageHash,
            price,
            author,
            royaltyPercentage,
            true
        );
        
        emit BookAdded(bookCount, title, author);
        return bookCount;
    }
    
    function getBook(uint256 bookId) public view returns (
        uint256 id,
        string memory title,
        string memory pdfHash,
        string memory imageHash,
        uint256 price,
        address author,
        uint256 royaltyPercentage,
        bool isActive
    ) {
        Book memory book = books[bookId];
        require(book.isActive, "Book not found");
        return (
            book.id,
            book.title,
            book.pdfHash,
            book.imageHash,
            book.price,
            book.author,
            book.royaltyPercentage,
            book.isActive
        );
    }
    
    function buyBook(uint256 bookId) public payable {
        Book storage book = books[bookId];
        require(book.isActive, "Book not available");
        require(msg.value == book.price, "Incorrect payment amount");
        
        uint256 royaltyAmount = (msg.value * book.royaltyPercentage) / 100;
        uint256 sellerAmount = msg.value - royaltyAmount;
        
        book.author.transfer(royaltyAmount);
        payable(owner).transfer(sellerAmount);
        
        userPurchases[msg.sender].push(bookId);
        authorRoyalties[book.author] += royaltyAmount;
        
        emit BookPurchased(bookId, msg.sender, msg.value);
        emit RoyaltyPaid(book.author, royaltyAmount);
    }
    
    function getAllBooks() public view returns (Book[] memory) {
        Book[] memory allBooks = new Book[](bookCount);
        for (uint256 i = 1; i <= bookCount; i++) {
            if (books[i].isActive) {
                allBooks[i-1] = books[i];
            }
        }
        return allBooks;
    }
    
    function getUserPurchases(address user) public view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    function getAuthorRoyalties(address author) public view returns (uint256) {
        return authorRoyalties[author];
    }
}