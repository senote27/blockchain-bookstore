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
    }

    uint256 public bookCount = 0;
    mapping(uint256 => Book) public books;

    mapping(address => uint256[]) public purchases;
    mapping(address => uint256) public royalties;

    event BookAdded(uint256 bookId, string title, address seller);
    event BookPurchased(uint256 bookId, address buyer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addBook(
        string memory _title,
        string memory _pdfHash,
        string memory _imageHash,
        uint256 _price,
        address payable _author
    ) public {
        books[bookCount] = Book(
            bookCount,
            _title,
            _pdfHash,
            _imageHash,
            _price,
            _author
        );
        emit BookAdded(bookCount, _title, msg.sender);
        bookCount++;
    }

    function buyBook(uint256 _bookId) public payable {
        Book memory book = books[_bookId];
        require(msg.value == book.price, "Incorrect value sent.");

        // Transfer funds to author
        book.author.transfer(msg.value);
        royalties[book.author] += msg.value;

        // Record the purchase
        purchases[msg.sender].push(_bookId);

        emit BookPurchased(_bookId, msg.sender);
    }

    function getBooks() public view returns (Book[] memory) {
        Book[] memory allBooks = new Book[](bookCount);
        for (uint256 i = 0; i < bookCount; i++) {
            allBooks[i] = books[i];
        }
        return allBooks;
    }

    function getPurchases(address _user) public view returns (uint256[] memory) {
        return purchases[_user];
    }

    function getRoyalties(address _author) public view returns (uint256) {
        return royalties[_author];
    }
}