// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {
    FHE,
    ebool,
    euint128,
    InEuint128
} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title EventNestTicket
 * @dev CoFHE-ready event ticketing with tiered NFT tickets and confidential access checks.
 */
contract EventNestTicket is ERC721, ReentrancyGuard {
    error TierCapacityTooHigh();

    uint256 private constant TIMESTAMP_MILLISECONDS_THRESHOLD = 1_000_000_000_000;

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
        bool requiresConfidentialAccess;
    }

    struct Ticket {
        uint256 eventId;
        bool isVIP;
        bool used;
        uint8 tierId;
    }

    struct TicketTier {
        string name;
        uint256 capacity;
        uint256 priceWei;
        bool transferable;
        bool active;
        uint256 totalSold;
    }

    struct TierInput {
        string name;
        uint256 capacity;
        uint256 priceWei;
        bool transferable;
        bool active;
    }

    struct PendingConfidentialAccess {
        ebool accessResult;
        uint64 accessVersion;
        uint8 tierId;
        bool used;
    }

    uint8 public constant MAX_TIERS_PER_EVENT = 16;

    uint256 private _eventCounter;
    uint256 private _ticketCounter;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => string) private ticketTokenURIs;
    mapping(uint256 => address[]) public eventAttendees;
    mapping(uint256 => address) public eventOrganizers;
    mapping(uint256 => TicketTier[]) private eventTiers;
    mapping(uint256 => mapping(address => uint256)) private eventTicketByHolder;
    mapping(uint256 => mapping(address => uint256)) private eventAttendeeIndex;
    mapping(uint256 => uint256) public eventPendingRevenue;

    mapping(uint256 => mapping(address => bool)) public eventWhitelist;

    mapping(uint256 => euint128) private confidentialInviteCredentials;
    mapping(uint256 => bool) public confidentialInviteConfigured;
    mapping(uint256 => uint64) private confidentialAccessVersions;
    mapping(uint256 => mapping(uint8 => euint128)) private encryptedTierConditions;
    mapping(uint256 => mapping(uint8 => bool)) public encryptedTierConditionConfigured;
    mapping(uint256 => mapping(address => PendingConfidentialAccess)) private pendingConfidentialAccess;

    event EventCreated(uint256 indexed eventId, address indexed organizer, string name, bool isPrivate);
    event EventUpdated(uint256 indexed eventId, address indexed organizer);
    event TicketMinted(uint256 indexed ticketId, uint256 indexed eventId, address indexed holder);
    event AccessVerified(address indexed user, uint256 indexed eventId, bool isVIP);
    event TicketCheckedIn(uint256 indexed ticketId, uint256 indexed eventId, address indexed holder, address verifier);
    event TicketBurned(uint256 indexed ticketId, uint256 indexed eventId, address indexed holder);
    event TicketPaymentReceived(uint256 indexed eventId, address indexed organizer, uint256 amount);
    event TicketPaymentReleased(uint256 indexed eventId, address indexed organizer, uint256 amount);
    event WhitelistUpdated(uint256 indexed eventId, address indexed wallet, bool isWhitelisted);
    event TicketTierUpdated(
        uint256 indexed eventId,
        uint8 indexed tierId,
        string name,
        uint256 capacity,
        uint256 priceWei,
        bool transferable,
        bool active
    );
    event ConfidentialInviteCodeUpdated(uint256 indexed eventId, bytes32 credentialHandle);
    event EncryptedTierConditionUpdated(uint256 indexed eventId, uint8 indexed tierId, bytes32 conditionHandle);
    event ConfidentialAccessRequested(
        uint256 indexed eventId,
        address indexed requester,
        uint8 indexed tierId,
        bytes32 accessResult
    );
    event ConfidentialAccessClaimed(uint256 indexed eventId, address indexed requester, uint8 indexed tierId);

    constructor()
        ERC721("EventNest Ticket", "ENFT")
    {}

    modifier onlyEventOrganizer(uint256 eventId) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        require(msg.sender == eventOrganizers[eventId], "Not organizer");
        _;
    }

    function _eventTimestampToSeconds(uint256 eventDate) private pure returns (uint256) {
        return eventDate >= TIMESTAMP_MILLISECONDS_THRESHOLD ? eventDate / 1000 : eventDate;
    }

    function _eventHasStarted(uint256 eventId) private view returns (bool) {
        return _eventTimestampToSeconds(events[eventId].eventDate) <= block.timestamp;
    }

    function _validateEventInput(
        string memory name,
        uint256 eventDate,
        uint256 maxAttendees,
        bool isPrivate,
        bool requiresInviteCode,
        bool requiresWhitelist,
        bool requiresConfidentialAccess
    ) private view {
        require(bytes(name).length > 0, "Name required");
        require(eventDate > 0, "Event date required");
        require(_eventTimestampToSeconds(eventDate) > block.timestamp, "Event date must be future");
        require(maxAttendees > 0, "Capacity required");
        require(!requiresInviteCode || requiresConfidentialAccess, "Invite requires confidential access");
        require(
            !isPrivate || requiresInviteCode || requiresWhitelist || requiresConfidentialAccess,
            "Private event needs access rule"
        );
    }

    function _createEvent(
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 eventDate,
        uint256 maxAttendees,
        uint256 ticketPriceWei,
        bool isPrivate,
        bool requiresInviteCode,
        bool requiresWhitelist,
        bool requiresConfidentialAccess
    ) private returns (uint256) {
        _validateEventInput(
            name,
            eventDate,
            maxAttendees,
            isPrivate,
            requiresInviteCode,
            requiresWhitelist,
            requiresConfidentialAccess
        );

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
            totalTicketsSold: 0,
            requiresConfidentialAccess: requiresConfidentialAccess
        });

        if (requiresWhitelist) {
            eventWhitelist[eventId][msg.sender] = true;
            emit WhitelistUpdated(eventId, msg.sender, true);
        }

        emit EventCreated(eventId, msg.sender, name, isPrivate);
        return eventId;
    }

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
        uint256 eventId = _createEvent(
            name,
            description,
            metadataURI,
            eventDate,
            maxAttendees,
            ticketPriceWei,
            isPrivate,
            requiresInviteCode,
            requiresWhitelist,
            false
        );
        _setTicketTier(eventId, 0, "General", maxAttendees, ticketPriceWei, true, true);
        return eventId;
    }

    function createEventWithTiers(
        string memory name,
        string memory description,
        string memory metadataURI,
        uint256 eventDate,
        uint256 maxAttendees,
        uint256 ticketPriceWei,
        bool isPrivate,
        bool requiresInviteCode,
        bool requiresWhitelist,
        bool requiresConfidentialAccess,
        TierInput[] calldata tiers
    ) external returns (uint256) {
        uint256 eventId = _createEvent(
            name,
            description,
            metadataURI,
            eventDate,
            maxAttendees,
            ticketPriceWei,
            isPrivate,
            requiresInviteCode,
            requiresWhitelist,
            requiresConfidentialAccess
        );

        _configureTicketTiers(eventId, maxAttendees, ticketPriceWei, tiers);

        return eventId;
    }

    function _configureTicketTiers(
        uint256 eventId,
        uint256 maxAttendees,
        uint256 ticketPriceWei,
        TierInput[] calldata tiers
    ) private {
        if (tiers.length == 0) {
            _setTicketTier(eventId, 0, "General", maxAttendees, ticketPriceWei, true, true);
        } else {
            require(tiers.length <= MAX_TIERS_PER_EVENT, "Too many tiers");
            bool hasActiveTier;
            for (uint8 i = 0; i < tiers.length; i++) {
                TierInput calldata tier = tiers[i];
                _setTicketTier(eventId, i, tier.name, tier.capacity, tier.priceWei, tier.transferable, tier.active);
                if (tier.active) {
                    hasActiveTier = true;
                }
            }
            require(hasActiveTier, "Active tier required");
        }
    }

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
        require(!_eventHasStarted(eventId), "Event already started");

        Event storage evt = events[eventId];
        _validateEventInput(
            name,
            eventDate,
            maxAttendees,
            isPrivate,
            requiresInviteCode,
            requiresWhitelist,
            evt.requiresConfidentialAccess
        );
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

        if (eventTiers[eventId].length == 1) {
            TicketTier storage tier = eventTiers[eventId][0];
            _setTicketTier(eventId, 0, tier.name, maxAttendees, ticketPriceWei, tier.transferable, tier.active);
        } else if (_activeTierCapacity(eventId) > maxAttendees) {
            revert TierCapacityTooHigh();
        }

        emit EventUpdated(eventId, msg.sender);
    }

    function setConfidentialInviteCode(
        uint256 eventId,
        InEuint128 memory encryptedCredential
    ) external onlyEventOrganizer(eventId) {
        require(!_eventHasStarted(eventId), "Event already started");
        _setConfidentialInviteCredential(eventId, encryptedCredential);
    }

    function _setConfidentialInviteCredential(
        uint256 eventId,
        InEuint128 memory encryptedCredential
    ) private {
        euint128 credential = FHE.asEuint128(encryptedCredential);
        FHE.allowThis(credential);
        FHE.allowSender(credential);

        confidentialInviteCredentials[eventId] = credential;
        confidentialInviteConfigured[eventId] = true;
        confidentialAccessVersions[eventId]++;

        Event storage evt = events[eventId];
        evt.isPrivate = true;
        evt.requiresInviteCode = true;
        evt.requiresConfidentialAccess = true;

        emit ConfidentialInviteCodeUpdated(eventId, FHE.unwrap(credential));
        emit EventUpdated(eventId, msg.sender);
    }

    function setEncryptedTierCondition(
        uint256 eventId,
        uint8 tierId,
        InEuint128 memory encryptedCondition
    ) external onlyEventOrganizer(eventId) {
        require(!_eventHasStarted(eventId), "Event already started");
        require(_tierExists(eventId, tierId), "Tier does not exist");
        euint128 condition = FHE.asEuint128(encryptedCondition);
        FHE.allowThis(condition);
        FHE.allowSender(condition);
        encryptedTierConditions[eventId][tierId] = condition;
        encryptedTierConditionConfigured[eventId][tierId] = true;
        confidentialAccessVersions[eventId]++;
        emit EncryptedTierConditionUpdated(eventId, tierId, FHE.unwrap(condition));
    }

    function addToWhitelist(uint256 eventId, address wallet) external onlyEventOrganizer(eventId) {
        eventWhitelist[eventId][wallet] = true;
        emit WhitelistUpdated(eventId, wallet, true);
    }

    function removeFromWhitelist(uint256 eventId, address wallet) external onlyEventOrganizer(eventId) {
        eventWhitelist[eventId][wallet] = false;
        emit WhitelistUpdated(eventId, wallet, false);
    }

    function batchAddToWhitelist(uint256 eventId, address[] calldata wallets) external onlyEventOrganizer(eventId) {
        for (uint256 i = 0; i < wallets.length; i++) {
            eventWhitelist[eventId][wallets[i]] = true;
            emit WhitelistUpdated(eventId, wallets[i], true);
        }
    }

    function setTicketTier(
        uint256 eventId,
        uint8 tierId,
        string memory name,
        uint256 capacity,
        uint256 priceWei,
        bool transferable,
        bool active
    ) external onlyEventOrganizer(eventId) {
        require(!_eventHasStarted(eventId), "Event already started");
        _setTicketTier(eventId, tierId, name, capacity, priceWei, transferable, active);
    }

    function _setTicketTier(
        uint256 eventId,
        uint8 tierId,
        string memory name,
        uint256 capacity,
        uint256 priceWei,
        bool transferable,
        bool active
    ) private {
        require(tierId < MAX_TIERS_PER_EVENT, "Tier limit reached");
        require(bytes(name).length > 0, "Tier name required");
        require(capacity > 0, "Tier capacity required");

        TicketTier[] storage tiers = eventTiers[eventId];
        require(tierId <= tiers.length, "Tier gap");

        if (tierId == tiers.length) {
            tiers.push(
                TicketTier({
                    name: name,
                    capacity: capacity,
                    priceWei: priceWei,
                    transferable: transferable,
                    active: active,
                    totalSold: 0
                })
            );
        } else {
            TicketTier storage tier = tiers[tierId];
            require(capacity >= tier.totalSold, "Tier capacity below sold");
            tier.name = name;
            tier.capacity = capacity;
            tier.priceWei = priceWei;
            tier.transferable = transferable;
            tier.active = active;
        }

        if (active && _activeTierCapacity(eventId) > events[eventId].maxAttendees) {
            revert TierCapacityTooHigh();
        }

        emit TicketTierUpdated(eventId, tierId, name, capacity, priceWei, transferable, active);
    }

    function _activeTierCapacity(uint256 eventId) private view returns (uint256 capacity) {
        TicketTier[] storage tiers = eventTiers[eventId];
        for (uint8 i = 0; i < tiers.length; i++) {
            if (tiers[i].active) {
                capacity += tiers[i].capacity;
            }
        }
    }

    function getEventCount() external view returns (uint256) {
        return _eventCounter;
    }

    function getTicketCount() external view returns (uint256) {
        return _ticketCounter;
    }

    function getEvent(uint256 eventId) external view returns (Event memory) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return events[eventId];
    }

    function getAttendeeCount(uint256 eventId) external view returns (uint256) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return events[eventId].totalTicketsSold;
    }

    function getEventAttendees(uint256 eventId) external view returns (address[] memory) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return eventAttendees[eventId];
    }

    function getTicketTiers(uint256 eventId) external view returns (TicketTier[] memory) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return eventTiers[eventId];
    }

    function getTicketTier(uint256 eventId, uint8 tierId) external view returns (TicketTier memory) {
        require(_tierExists(eventId, tierId), "Tier does not exist");
        return eventTiers[eventId][tierId];
    }

    function getPendingConfidentialAccess(
        uint256 eventId,
        address requester
    ) external view returns (bytes32 accessResult, uint8 tierId, bool used) {
        PendingConfidentialAccess storage pending = pendingConfidentialAccess[eventId][requester];
        return (FHE.unwrap(pending.accessResult), pending.tierId, pending.used);
    }

    function hasTicket(uint256 eventId, address holder) public view returns (bool) {
        uint256 ticketPointer = eventTicketByHolder[eventId][holder];
        return ticketPointer != 0 && _ownerOf(ticketPointer - 1) == holder;
    }

    function getTicketIdForAttendee(uint256 eventId, address holder) external view returns (uint256) {
        require(hasTicket(eventId, holder), "No ticket for event");
        return eventTicketByHolder[eventId][holder] - 1;
    }

    function requestConfidentialAccess(
        uint256 eventId,
        uint8 tierId,
        InEuint128 memory encryptedCredential
    ) external returns (bytes32) {
        Event storage evt = events[eventId];
        require(evt.eventDate > 0, "Event does not exist");
        require(!_eventHasStarted(eventId), "Event already started");
        require(evt.requiresConfidentialAccess, "Confidential access disabled");
        require(confidentialInviteConfigured[eventId], "Confidential invite not set");
        require(_tierExists(eventId, tierId), "Tier does not exist");
        if (evt.requiresWhitelist) {
            require(eventWhitelist[eventId][msg.sender], "Access denied");
        }

        euint128 credential = FHE.asEuint128(encryptedCredential);
        FHE.allowThis(credential);

        ebool accessResult = encryptedTierConditionConfigured[eventId][tierId]
            ? FHE.eq(credential, encryptedTierConditions[eventId][tierId])
            : FHE.eq(credential, confidentialInviteCredentials[eventId]);
        FHE.allowThis(accessResult);
        FHE.allowSender(accessResult);

        pendingConfidentialAccess[eventId][msg.sender] = PendingConfidentialAccess({
            accessResult: accessResult,
            accessVersion: confidentialAccessVersions[eventId],
            tierId: tierId,
            used: false
        });

        bytes32 accessHandle = FHE.unwrap(accessResult);
        emit ConfidentialAccessRequested(eventId, msg.sender, tierId, accessHandle);
        return accessHandle;
    }

    function mintTicketForTier(
        uint256 eventId,
        address to,
        uint8 tierId,
        bytes32 /* accessProof */
    ) external payable nonReentrant returns (uint256) {
        return _mintTicket(eventId, to, tierId, tierId == 1, false);
    }

    function mintConfidentialTicket(
        uint256 eventId,
        address to,
        uint8 tierId,
        bytes32 accessResultHandle,
        bool accessGranted,
        bytes calldata decryptSignature
    ) external payable nonReentrant returns (uint256) {
        require(to == msg.sender, "Confidential mint is bound to sender");

        PendingConfidentialAccess storage pending = pendingConfidentialAccess[eventId][msg.sender];
        require(!pending.used, "Access already used");
        require(pending.accessVersion == confidentialAccessVersions[eventId], "Access denied");
        require(pending.tierId == tierId, "Tier mismatch");
        require(FHE.unwrap(pending.accessResult) == accessResultHandle, "Access handle mismatch");
        require(accessGranted, "Access denied");
        require(
            FHE.verifyDecryptResult(pending.accessResult, accessGranted, decryptSignature),
            "Invalid decrypt signature"
        );

        pending.used = true;
        emit ConfidentialAccessClaimed(eventId, msg.sender, tierId);

        return _mintTicket(eventId, to, tierId, tierId == 1, true);
    }

    function _mintTicket(
        uint256 eventId,
        address to,
        uint8 tierId,
        bool isVIP,
        bool confidentialAccessVerified
    ) private returns (uint256) {
        Event storage evt = events[eventId];
        require(evt.eventDate > 0, "Event does not exist");
        require(!_eventHasStarted(eventId), "Event already started");
        require(to != address(0), "Invalid recipient");
        require(to == msg.sender, "Mint recipient must be sender");
        require(evt.maxAttendees > evt.totalTicketsSold, "Sold out");
        require(!hasTicket(eventId, to), "Recipient already has ticket");
        require(_tierExists(eventId, tierId), "Tier does not exist");

        TicketTier storage tier = eventTiers[eventId][tierId];
        require(tier.active, "Tier inactive");
        require(tier.capacity > tier.totalSold, "Tier sold out");
        require(msg.value == tier.priceWei, "Incorrect ticket payment");

        if (evt.isPrivate || evt.requiresInviteCode || evt.requiresWhitelist || evt.requiresConfidentialAccess) {
            require(_verifyAccess(eventId, to, confidentialAccessVerified), "Access denied");
        }

        uint256 ticketId = _ticketCounter++;

        tickets[ticketId] = Ticket({
            eventId: eventId,
            isVIP: isVIP,
            used: false,
            tierId: tierId
        });

        _safeMint(to, ticketId);
        _setTokenURI(ticketId, evt.metadataURI);
        evt.totalTicketsSold++;
        tier.totalSold++;

        emit AccessVerified(to, eventId, isVIP);
        emit TicketMinted(ticketId, eventId, to);

        if (msg.value > 0) {
            address organizer = eventOrganizers[eventId];
            eventPendingRevenue[eventId] += msg.value;
            emit TicketPaymentReceived(eventId, organizer, msg.value);
        }

        return ticketId;
    }

    function withdrawEventRevenue(uint256 eventId) external nonReentrant onlyEventOrganizer(eventId) {
        uint256 amount = eventPendingRevenue[eventId];
        require(amount > 0, "No revenue to withdraw");

        eventPendingRevenue[eventId] = 0;
        (bool paid, ) = payable(msg.sender).call{value: amount}("");
        require(paid, "Payment failed");

        emit TicketPaymentReleased(eventId, msg.sender, amount);
    }

    function _verifyAccess(
        uint256 eventId,
        address user,
        bool confidentialAccessVerified
    ) internal view returns (bool) {
        Event storage evt = events[eventId];
        bool whitelistOk = !evt.requiresWhitelist || eventWhitelist[eventId][user];
        bool inviteOk = !evt.requiresConfidentialAccess || confidentialAccessVerified;

        return whitelistOk && inviteOk;
    }

    function isWhitelisted(uint256 eventId, address wallet) external view returns (bool) {
        return eventWhitelist[eventId][wallet];
    }

    function getEventOrganizer(uint256 eventId) external view returns (address) {
        require(events[eventId].eventDate > 0, "Event does not exist");
        return eventOrganizers[eventId];
    }

    function useTicket(uint256 ticketId) external {
        address holder = ownerOf(ticketId);
        Ticket storage ticket = tickets[ticketId];
        uint256 eventId = ticket.eventId;
        require(events[eventId].eventDate > 0, "Event does not exist");
        require(msg.sender == eventOrganizers[eventId], "Not organizer");
        require(!ticket.used, "Ticket already used");
        ticket.used = true;
        emit TicketCheckedIn(ticketId, eventId, holder, msg.sender);
    }

    function getTicket(uint256 ticketId) external view returns (Ticket memory, Event memory) {
        require(_ownerOf(ticketId) != address(0), "Ticket does not exist");
        Ticket memory ticket = tickets[ticketId];
        Event memory eventInfo = events[ticket.eventId];
        return (ticket, eventInfo);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        _requireOwned(tokenId);
        return ticketTokenURIs[tokenId];
    }

    function _setTokenURI(uint256 tokenId, string memory uri) private {
        ticketTokenURIs[tokenId] = uri;
    }

    function _addAttendee(uint256 eventId, address wallet) private {
        if (eventAttendeeIndex[eventId][wallet] != 0) {
            return;
        }

        address[] storage attendees = eventAttendees[eventId];
        attendees.push(wallet);
        eventAttendeeIndex[eventId][wallet] = attendees.length;
    }

    function _removeAttendee(uint256 eventId, address wallet) private {
        uint256 indexPointer = eventAttendeeIndex[eventId][wallet];
        if (indexPointer == 0) {
            return;
        }

        address[] storage attendees = eventAttendees[eventId];
        uint256 index = indexPointer - 1;
        uint256 lastIndex = attendees.length - 1;

        if (index != lastIndex) {
            address lastWallet = attendees[lastIndex];
            attendees[index] = lastWallet;
            eventAttendeeIndex[eventId][lastWallet] = indexPointer;
        }

        attendees.pop();
        delete eventAttendeeIndex[eventId][wallet];
    }

    function _tierExists(uint256 eventId, uint8 tierId) private view returns (bool) {
        return tierId < eventTiers[eventId].length;
    }

    function _canReceiveTicketTransfer(uint256 eventId, address recipient) private view returns (bool) {
        Event storage evt = events[eventId];
        if (evt.requiresWhitelist && !eventWhitelist[eventId][recipient]) {
            return false;
        }
        if ((evt.requiresInviteCode || evt.requiresConfidentialAccess) && !eventWhitelist[eventId][recipient]) {
            return false;
        }
        return true;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        uint256 eventId = tickets[tokenId].eventId;

        if (from != address(0) && to != address(0)) {
            Ticket storage ticket = tickets[tokenId];
            require(!_eventHasStarted(eventId), "Event already started");
            require(!ticket.used, "Ticket already used");
            require(eventTiers[eventId][ticket.tierId].transferable, "Tier is non-transferable");
            require(!hasTicket(eventId, to), "Recipient already has ticket");
            require(_canReceiveTicketTransfer(eventId, to), "Recipient not approved");
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

    function burnTicket(uint256 ticketId) external {
        address holder = ownerOf(ticketId);
        require(holder == msg.sender, "Not authorized");

        Ticket storage ticket = tickets[ticketId];
        uint256 eventId = ticket.eventId;
        uint8 tierId = ticket.tierId;

        require(!_eventHasStarted(eventId), "Event already started");
        require(!ticket.used, "Ticket already used");

        ticket.used = true;
        _burn(ticketId);
        delete ticketTokenURIs[ticketId];
        events[eventId].totalTicketsSold--;
        eventTiers[eventId][tierId].totalSold--;
        emit TicketBurned(ticketId, eventId, holder);
    }
}
