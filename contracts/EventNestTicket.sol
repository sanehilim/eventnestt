// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title EventNestTicket
 * @dev Privacy-first event ticketing contract with whitelist and invite code support
 */
contract EventNestTicket is ERC721, ERC721URIStorage, ReentrancyGuard, EIP712 {
    // Event structure
    struct Event {
        string name;
        string description;
        string metadataURI;
        uint256 eventDate;
        uint256 maxAttendees;
        uint256 ticketPriceWei;
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
    mapping(uint256 => address) public eventOrganizers;
    mapping(uint256 => mapping(address => uint256)) private eventTicketByHolder;

    // Whitelist: eventId => wallet => isWhitelisted
    mapping(uint256 => mapping(address => bool)) public eventWhitelist;
    // Invite codes: eventId => code hash
    mapping(uint256 => bytes32) public eventInviteCodes;

    // Events
    event EventCreated(uint256 indexed eventId, address indexed organizer, string name, bool isPrivate);
    event EventUpdated(uint256 indexed eventId, address indexed organizer);
    event TicketMinted(uint256 indexed ticketId, uint256 indexed eventId, address indexed holder);
    event AccessVerified(address indexed user, uint256 indexed eventId, bool isVIP);
    event TicketCheckedIn(uint256 indexed ticketId, uint256 indexed eventId, address indexed holder, address verifier);
    event TicketBurned(uint256 indexed ticketId, uint256 indexed eventId, address indexed holder);
    event TicketPaymentReleased(uint256 indexed eventId, address indexed organizer, uint256 amount);
    event InviteCodeUpdated(uint256 indexed eventId);
    event WhitelistUpdated(uint256 indexed eventId, address indexed wallet, bool isWhitelisted);

    constructor()
        ERC721("EventNest Ticket", "ENFT")
        EIP712("EventNestTicket", "1")
    {}

    modifier onlyEventOrganizer(uint256 eventId) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        require(msg.sender == eventOrganizers[eventId], "Not organizer");
        _;
    }

    function _validateEventInput(
        string memory name,
        uint256 eventDate,
        uint256 maxAttendees,
        bool isPrivate,
        bool requiresInviteCode,
        bool requiresWhitelist
    ) private pure {
        require(bytes(name).length > 0, "Name required");
        require(eventDate > 0, "Event date required");
        require(maxAttendees > 0, "Capacity required");
        require(!isPrivate || requiresInviteCode || requiresWhitelist, "Private event needs access rule");
    }

    // Create a new event
    function createEvent(
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 eventDate,
        uint256 maxAttendees,
        uint256 ticketPriceWei,
        bool isPrivate,
        bool requiresInviteCode,
        bool requiresWhitelist
    ) external returns (uint256) {
        _validateEventInput(name, eventDate, maxAttendees, isPrivate, requiresInviteCode, requiresWhitelist);

        uint256 eventId = _eventCounter++;
        eventOrganizers[eventId] = msg.sender;

        events[eventId] = Event({
            name: name,
            description: description,
            metadataURI: metadataURI,
            eventDate: eventDate,
            maxAttendees: maxAttendees,
            ticketPriceWei: ticketPriceWei,
            isPrivate: isPrivate,
            requiresInviteCode: requiresInviteCode,
            requiresWhitelist: requiresWhitelist,
            totalTicketsSold: 0
        });

        if (requiresWhitelist) {
            eventWhitelist[eventId][msg.sender] = true;
            emit WhitelistUpdated(eventId, msg.sender, true);
        }

        emit EventCreated(eventId, msg.sender, name, isPrivate);
        return eventId;
    }

    // Update event metadata and access settings (event organizer only)
    function updateEvent(
        uint256 eventId,
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 eventDate,
        uint256 maxAttendees,
        uint256 ticketPriceWei,
        bool isPrivate,
        bool requiresInviteCode,
        bool requiresWhitelist
    ) external onlyEventOrganizer(eventId) {
        Event storage evt = events[eventId];
        _validateEventInput(name, eventDate, maxAttendees, isPrivate, requiresInviteCode, requiresWhitelist);
        require(maxAttendees >= evt.totalTicketsSold, "Capacity below sold tickets");

        evt.name = name;
        evt.description = description;
        evt.metadataURI = metadataURI;
        evt.eventDate = eventDate;
        evt.maxAttendees = maxAttendees;
        evt.ticketPriceWei = ticketPriceWei;
        evt.isPrivate = isPrivate;
        evt.requiresInviteCode = requiresInviteCode;
        evt.requiresWhitelist = requiresWhitelist;

        emit EventUpdated(eventId, msg.sender);
    }

    // Set invite code for an event (event organizer only)
    function setInviteCode(uint256 eventId, bytes32 codeHash) external onlyEventOrganizer(eventId) {
        eventInviteCodes[eventId] = codeHash;
        emit InviteCodeUpdated(eventId);
    }

    // Add to whitelist (event organizer only)
    function addToWhitelist(uint256 eventId, address wallet) external onlyEventOrganizer(eventId) {
        eventWhitelist[eventId][wallet] = true;
        emit WhitelistUpdated(eventId, wallet, true);
    }

    // Remove from whitelist (event organizer only)
    function removeFromWhitelist(uint256 eventId, address wallet) external onlyEventOrganizer(eventId) {
        eventWhitelist[eventId][wallet] = false;
        emit WhitelistUpdated(eventId, wallet, false);
    }

    // Batch add to whitelist
    function batchAddToWhitelist(uint256 eventId, address[] calldata wallets) external onlyEventOrganizer(eventId) {
        for (uint i = 0; i < wallets.length; i++) {
            eventWhitelist[eventId][wallets[i]] = true;
            emit WhitelistUpdated(eventId, wallets[i], true);
        }
    }

    // Get event count
    function getEventCount() external view returns (uint256) {
        return _eventCounter;
    }

    // Get ticket count
    function getTicketCount() external view returns (uint256) {
        return _ticketCounter;
    }

    // Get event by ID
    function getEvent(uint256 eventId) external view returns (Event memory) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return events[eventId];
    }

    // Get attendee count
    function getAttendeeCount(uint256 eventId) external view returns (uint256) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return events[eventId].totalTicketsSold;
    }

    function getEventAttendees(uint256 eventId) external view returns (address[] memory) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return eventAttendees[eventId];
    }

    function hasTicket(uint256 eventId, address holder) public view returns (bool) {
        uint256 ticketPointer = eventTicketByHolder[eventId][holder];
        return ticketPointer != 0 && _ownerOf(ticketPointer - 1) == holder;
    }

    function getTicketIdForAttendee(uint256 eventId, address holder) external view returns (uint256) {
        require(hasTicket(eventId, holder), "No ticket for event");
        return eventTicketByHolder[eventId][holder] - 1;
    }

    // Mint ticket with access verification
    function mintTicket(
        uint256 eventId,
        address to,
        bool isVIP,
        bytes32 accessProof
    ) external payable nonReentrant returns (uint256) {
        Event storage evt = events[eventId];
        require(evt.eventDate > 0, "Event does not exist");
        require(to != address(0), "Invalid recipient");
        require(evt.maxAttendees > evt.totalTicketsSold, "Sold out");
        require(!hasTicket(eventId, to), "Recipient already has ticket");
        require(msg.value == evt.ticketPriceWei, "Incorrect ticket payment");

        // Verify access whenever an event has gated rules.
        if (evt.isPrivate || evt.requiresInviteCode || evt.requiresWhitelist) {
            require(_verifyAccess(eventId, to, accessProof), "Access denied");
        }

        uint256 ticketId = _ticketCounter++;

        tickets[ticketId] = Ticket({
            eventId: eventId,
            isVIP: isVIP,
            used: false
        });

        _safeMint(to, ticketId);
        _setTokenURI(ticketId, evt.metadataURI);
        evt.totalTicketsSold++;

        emit AccessVerified(to, eventId, isVIP);
        emit TicketMinted(ticketId, eventId, to);

        if (msg.value > 0) {
            address organizer = eventOrganizers[eventId];
            (bool paid, ) = payable(organizer).call{value: msg.value}("");
            require(paid, "Payment failed");
            emit TicketPaymentReleased(eventId, organizer, msg.value);
        }

        return ticketId;
    }

    // Internal access verification
    function _verifyAccess(uint256 eventId, address user, bytes32 accessProof) internal view returns (bool) {
        Event storage evt = events[eventId];
        bool whitelistOk = !evt.requiresWhitelist;
        bool inviteOk = !evt.requiresInviteCode;

        if (evt.requiresWhitelist) {
            whitelistOk = eventWhitelist[eventId][user];
        }

        if (evt.requiresInviteCode) {
            inviteOk =
                eventInviteCodes[eventId] != bytes32(0) &&
                eventInviteCodes[eventId] == accessProof;
        }

        return whitelistOk && inviteOk;
    }

    // Verify access (public view function)
    function verifyAccess(
        uint256 eventId,
        bytes32 /* encryptedWallet */,
        bytes32 accessProof
    ) external view returns (bool) {
        Event storage evt = events[eventId];
        require(evt.eventDate > 0, "Event does not exist");

        // If no access rules are enabled, allow.
        if (!evt.isPrivate && !evt.requiresInviteCode && !evt.requiresWhitelist) {
            return true;
        }

        return _verifyAccess(eventId, msg.sender, accessProof);
    }

    // Check if address is whitelisted
    function isWhitelisted(uint256 eventId, address wallet) external view returns (bool) {
        return eventWhitelist[eventId][wallet];
    }

    function getEventOrganizer(uint256 eventId) external view returns (address) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return eventOrganizers[eventId];
    }

    // Use ticket (mark as used)
    function useTicket(uint256 ticketId) external {
        address holder = ownerOf(ticketId);
        Ticket storage ticket = tickets[ticketId];
        uint256 eventId = ticket.eventId;
        require(events[eventId].eventDate > 0, "Event does not exist");
        require(
            holder == msg.sender ||
                msg.sender == eventOrganizers[eventId],
            "Not authorized"
        );
        require(!ticket.used, "Ticket already used");
        ticket.used = true;
        emit TicketCheckedIn(ticketId, eventId, holder, msg.sender);
    }

    // Get ticket info
    function getTicket(uint256 ticketId) external view returns (Ticket memory, Event memory) {
        require(_ownerOf(ticketId) != address(0), "Ticket does not exist");
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

    function _addAttendee(uint256 eventId, address wallet) private {
        address[] storage attendees = eventAttendees[eventId];
        for (uint256 i = 0; i < attendees.length; i++) {
            if (attendees[i] == wallet) {
                return;
            }
        }
        attendees.push(wallet);
    }

    function _removeAttendee(uint256 eventId, address wallet) private {
        address[] storage attendees = eventAttendees[eventId];
        for (uint256 i = 0; i < attendees.length; i++) {
            if (attendees[i] == wallet) {
                attendees[i] = attendees[attendees.length - 1];
                attendees.pop();
                return;
            }
        }
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        uint256 eventId = tickets[tokenId].eventId;

        if (from != address(0) && to != address(0)) {
            require(!tickets[tokenId].used, "Ticket already used");
            require(!hasTicket(eventId, to), "Recipient already has ticket");
        }

        address previousOwner = super._update(to, tokenId, auth);

        if (previousOwner != address(0) && eventTicketByHolder[eventId][previousOwner] == tokenId + 1) {
            eventTicketByHolder[eventId][previousOwner] = 0;
            _removeAttendee(eventId, previousOwner);
        }

        if (to != address(0)) {
            eventTicketByHolder[eventId][to] = tokenId + 1;
            _addAttendee(eventId, to);
        }

        return previousOwner;
    }

    // Burn ticket
    function burnTicket(uint256 ticketId) external {
        address holder = ownerOf(ticketId);
        require(holder == msg.sender, "Not authorized");
        uint256 eventId = tickets[ticketId].eventId;
        tickets[ticketId].used = true;
        _burn(ticketId);
        events[eventId].totalTicketsSold--;
        emit TicketBurned(ticketId, eventId, holder);
    }
}
