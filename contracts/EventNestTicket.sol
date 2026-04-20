// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/FHE.sol";
import "@fhenixprotocol/contracts/utils/EncryptedECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title EventNestTicket
 * @dev Privacy-first event ticketing contract using Fhenix FHE for encrypted access control
 */
contract EventNestTicket is ERC721, ERC721URIStorage, Ownable, EIP712 {
    using FHE for ebool;
    using FHE for euint32;
    using FHE for eaddress;

    // Event structure
    struct Event {
        string name;
        string description;
        string metadataURI;
        uint256 eventDate;
        uint256 maxAttendees;
        bool isPrivate;
        bool requiresInviteCode;
        bool requiresWhitelist;
        uint256 totalTicketsSold;
    }

    // Ticket structure
    struct Ticket {
        uint256 eventId;
        bool isVIP;
        bool used;
    }

    // State
    uint256 private _eventCounter;
    uint256 private _ticketCounter;
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => euint32) public encryptedAttendeeCount;
    mapping(uint256 => ebool) public encryptedInviteCodes;
    mapping(uint256 => ebool) public encryptedWhitelist;
    mapping(uint256 => bytes32) public eventInviteCodes;
    mapping(uint256 => mapping(address => bool)) public eventWhitelist;

    // Encrypted ticket price
    mapping(uint256 => euint32) public encryptedTicketPrice;
    mapping(uint256 => euint32) public encryptedVIPPrice;

    // Event to ticket holders
    mapping(uint256 => address[]) public eventAttendees;

    // Events
    event EventCreated(uint256 indexed eventId, string name, bool isPrivate);
    event TicketMinted(uint256 indexed ticketId, uint256 indexed eventId, address indexed holder);
    event AccessVerified(address indexed user, uint256 indexed eventId, bool isVIP);

    constructor(address initialOwner)
        ERC721("EventNest Ticket", "ENFT")
        Ownable(initialOwner)
        EIP712("EventNestTicket", "1")
    {}

    // Create a new event
    function createEvent(
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 eventDate,
        uint256 maxAttendees,
        bool isPrivate,
        bool requiresInviteCode,
        bool requiresWhitelist
    ) external returns (uint256) {
        uint256 eventId = _eventCounter++;

        events[eventId] = Event({
            name: name,
            description: description,
            metadataURI: metadataURI,
            eventDate: eventDate,
            maxAttendees: maxAttendees,
            isPrivate: isPrivate,
            requiresInviteCode: requiresInviteCode,
            requiresWhitelist: requiresWhitelist,
            totalTicketsSold: 0
        });

        // Initialize encrypted counter
        encryptedAttendeeCount[eventId] = FHE.asEuint32(0);

        emit EventCreated(eventId, name, isPrivate);
        return eventId;
    }

    // Set encrypted ticket price (organizer only)
    function setTicketPrice(uint256 eventId, bytes32 encryptedPrice) external onlyOwner {
        euint32 price = FHE.asEuint32(encryptedPrice);
        encryptedTicketPrice[eventId] = price;
    }

    // Set encrypted VIP price
    function setVIPPrice(uint256 eventId, bytes32 encryptedPrice) external onlyOwner {
        euint32 price = FHE.asEuint32(encryptedPrice);
        encryptedVIPPrice[eventId] = price;
    }

    // Add to whitelist (encrypted)
    function addToWhitelist(uint256 eventId, bytes32 encryptedWallet) external onlyOwner {
        ebool isWhitelisted = FHE.asEbool(encryptedWallet);
        encryptedWhitelist[eventId] = FHE.or(encryptedWhitelist[eventId], isWhitelisted);
    }

    // Set invite code for an event (organizer only)
    function setInviteCode(uint256 eventId, bytes32 encryptedCode) external onlyOwner {
        encryptedInviteCodes[eventId] = FHE.asEbool(encryptedCode);
        eventInviteCodes[eventId] = encryptedCode;
    }

    // Add to whitelist (both encrypted FHE and plaintext for easy checking)
    function addToWhitelist(uint256 eventId, address wallet) external onlyOwner {
        eventWhitelist[eventId][wallet] = true;
        ebool isWhitelisted = FHE.asEbool(keccak256(abi.encodePacked(wallet)));
        encryptedWhitelist[eventId] = FHE.or(encryptedWhitelist[eventId], isWhitelisted);
    }

    // Get event count
    function getEventCount() external view returns (uint256) {
        return _eventCounter;
    }

    // Get event by ID
    function getEvent(uint256 eventId) external view returns (Event memory) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return events[eventId];
    }

    // Verify invite code (encrypted)
    function verifyInviteCode(uint256 eventId, bytes32 encryptedCode) external returns (ebool) {
        ebool isValid = FHE.eq(FHE.asEuint256(encryptedCode), FHE.asEuint256(eventInviteCodes[eventId]));
        return isValid;
    }

    // Check whitelist status (encrypted)
    function checkWhitelistStatus(uint256 eventId, bytes32 encryptedWallet) external returns (ebool) {
        return encryptedWhitelist[eventId];
    }

    // Mint ticket after verification
    function mintTicket(
        uint256 eventId,
        address to,
        bool isVIP,
        bytes32 /* encryptedProof - placeholder for FHE proof */
    ) external returns (uint256) {
        Event storage evt = events[eventId];
        require(evt.eventDate > 0, "Event does not exist");
        require(evt.maxAttendees > evt.totalTicketsSold, "Sold out");

        // For private events, verify access
        if (evt.isPrivate) {
            require(verifyAccessCheck(eventId, msg.sender), "Access denied");
        }

        uint256 ticketId = _ticketCounter++;

        tickets[ticketId] = Ticket({
            eventId: eventId,
            isVIP: isVIP,
            used: false
        });

        _safeMint(to, ticketId);
        evt.totalTicketsSold++;

        // Update encrypted count
        encryptedAttendeeCount[eventId] = FHE.add(encryptedAttendeeCount[eventId], FHE.asEuint32(1));
        eventAttendees[eventId].push(to);

        emit TicketMinted(ticketId, eventId, to);
        return ticketId;
    }

    // Internal access check
    function verifyAccessCheck(uint256 eventId, address user) internal view returns (bool) {
        Event storage evt = events[eventId];

        // Check whitelist if required
        if (evt.requiresWhitelist) {
            if (eventWhitelist[eventId][user]) {
                return true;
            }
        }

        // For invite code events, we check if the user is an attendee (invite codes are checked off-chain in this demo)
        // In a full FHE implementation, the encrypted invite code would be verified on-chain
        return false;
    }

    // Use ticket (mark as used)
    function useTicket(uint256 ticketId) external {
        require(ownerOf(ticketId) == msg.sender || msg.sender == owner(), "Not authorized");
        tickets[ticketId].used = true;
    }

    // Get ticket info
    function getTicket(uint256 ticketId) external view returns (Ticket memory, Event memory) {
        Ticket memory ticket = tickets[ticketId];
        Event memory eventInfo = events[ticket.eventId];
        return (ticket, eventInfo);
    }

    // Get attendee count (public)
    function getAttendeeCount(uint256 eventId) external view returns (uint256) {
        return events[eventId].totalTicketsSold;
    }

    // Verify access (public wrapper)
    function verifyAccess(
        uint256 eventId,
        bytes32 /* encryptedWallet */,
        bytes32 /* encryptedCode */
    ) external returns (bool) {
        Event storage evt = events[eventId];

        // If not private, allow
        if (!evt.isPrivate) {
            emit AccessVerified(msg.sender, eventId, false);
            return true;
        }

        // Check whitelist
        if (evt.requiresWhitelist) {
            if (eventWhitelist[eventId][msg.sender]) {
                emit AccessVerified(msg.sender, eventId, false);
                return true;
            }
            return false;
        }

        // For invite codes, we rely on mintTicket reverting if not whitelisted
        // In full FHE, encrypted code verification would happen here
        return false;
    }

    // Override required for ERC721
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Token URI
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // Burn ticket
    function burnTicket(uint256 ticketId) external {
        require(ownerOf(ticketId) == msg.sender, "Not authorized");
        uint256 eventId = tickets[ticketId].eventId;
        tickets[ticketId].used = true;
        _burn(ticketId);
        events[eventId].totalTicketsSold--;
    }
}
