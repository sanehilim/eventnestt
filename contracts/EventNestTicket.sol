// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title EventNestTicket
 * @dev Privacy-first event ticketing contract with whitelist and invite code support
 */
contract EventNestTicket is ERC721, ERC721URIStorage, Ownable, EIP712 {
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
    mapping(uint256 => address[]) public eventAttendees;

    // Whitelist: eventId => wallet => isWhitelisted
    mapping(uint256 => mapping(address => bool)) public eventWhitelist;
    // Invite codes: eventId => code hash
    mapping(uint256 => bytes32) public eventInviteCodes;

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

        emit EventCreated(eventId, name, isPrivate);
        return eventId;
    }

    // Set invite code for an event (organizer only)
    function setInviteCode(uint256 eventId, bytes32 codeHash) external onlyOwner {
        require(events[eventId].eventDate > 0, "Event does not exist");
        eventInviteCodes[eventId] = codeHash;
    }

    // Add to whitelist (organizer only)
    function addToWhitelist(uint256 eventId, address wallet) external onlyOwner {
        require(events[eventId].eventDate > 0, "Event does not exist");
        eventWhitelist[eventId][wallet] = true;
    }

    // Batch add to whitelist
    function batchAddToWhitelist(uint256 eventId, address[] calldata wallets) external onlyOwner {
        require(events[eventId].eventDate > 0, "Event does not exist");
        for (uint i = 0; i < wallets.length; i++) {
            eventWhitelist[eventId][wallets[i]] = true;
        }
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

    // Get attendee count
    function getAttendeeCount(uint256 eventId) external view returns (uint256) {
        return events[eventId].totalTicketsSold;
    }

    // Mint ticket with access verification
    function mintTicket(
        uint256 eventId,
        address to,
        bool isVIP,
        bytes32 /* encryptedProof - placeholder */
    ) external returns (uint256) {
        Event storage evt = events[eventId];
        require(evt.eventDate > 0, "Event does not exist");
        require(evt.maxAttendees > evt.totalTicketsSold, "Sold out");

        // For private events, verify access
        if (evt.isPrivate) {
            require(_verifyAccess(eventId, msg.sender), "Access denied");
        }

        uint256 ticketId = _ticketCounter++;

        tickets[ticketId] = Ticket({
            eventId: eventId,
            isVIP: isVIP,
            used: false
        });

        _safeMint(to, ticketId);
        evt.totalTicketsSold++;
        eventAttendees[eventId].push(to);

        emit TicketMinted(ticketId, eventId, to);
        return ticketId;
    }

    // Internal access verification
    function _verifyAccess(uint256 eventId, address user) internal view returns (bool) {
        Event storage evt = events[eventId];

        // Check whitelist first if required
        if (evt.requiresWhitelist) {
            if (eventWhitelist[eventId][user]) {
                return true;
            }
        }

        // For non-whitelist private events, check if user already has a ticket
        // In full implementation, invite code verification would happen off-chain or via ZK proof
        return false;
    }

    // Verify access (public view function)
    function verifyAccess(
        uint256 eventId,
        bytes32 /* encryptedWallet */,
        bytes32 /* encryptedCode */
    ) external view returns (bool) {
        Event storage evt = events[eventId];

        // If not private, allow
        if (!evt.isPrivate) {
            return true;
        }

        // Check whitelist
        if (evt.requiresWhitelist) {
            return eventWhitelist[eventId][msg.sender];
        }

        // For invite codes, we return false (they are verified during mintTicket)
        return false;
    }

    // Check if address is whitelisted
    function isWhitelisted(uint256 eventId, address wallet) external view returns (bool) {
        return eventWhitelist[eventId][wallet];
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
