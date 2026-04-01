package com.court.service.party;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parties")
public class PartyController {

    private final PartyService partyService;

    public PartyController(PartyService partyService) {
        this.partyService = partyService;
    }

    @PostMapping
    public PartyDtos.PartyResponse createParty(@Valid @RequestBody PartyDtos.CreatePartyRequest request) {
        return partyService.createParty(request);
    }

    @GetMapping
    public List<PartyDtos.PartyResponse> listParties(@RequestParam Long caseId) {
        return partyService.listParties(caseId);
    }

    @PostMapping("/contacts")
    public PartyDtos.ContactResponse createContact(@Valid @RequestBody PartyDtos.CreateContactRequest request) {
        return partyService.createContact(request);
    }

    @GetMapping("/contacts")
    public List<PartyDtos.ContactResponse> listContacts(@RequestParam Long partyId) {
        return partyService.listContacts(partyId);
    }
}
