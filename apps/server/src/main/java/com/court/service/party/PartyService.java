package com.court.service.party;

import com.court.service.casefile.CaseInfo;
import com.court.service.casefile.CaseInfoRepository;
import com.court.service.common.AuditService;
import com.court.service.common.NotFoundException;
import com.court.service.security.MaskingUtils;
import com.court.service.security.SensitiveCryptoService;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartyService {

    private final CaseInfoRepository caseInfoRepository;
    private final CasePartyRepository casePartyRepository;
    private final PartyContactRepository partyContactRepository;
    private final AuditService auditService;
    private final SensitiveCryptoService sensitiveCryptoService;

    public PartyService(
            CaseInfoRepository caseInfoRepository,
            CasePartyRepository casePartyRepository,
            PartyContactRepository partyContactRepository,
            AuditService auditService,
            SensitiveCryptoService sensitiveCryptoService) {
        this.caseInfoRepository = caseInfoRepository;
        this.casePartyRepository = casePartyRepository;
        this.partyContactRepository = partyContactRepository;
        this.auditService = auditService;
        this.sensitiveCryptoService = sensitiveCryptoService;
    }

    @Transactional
    public PartyDtos.PartyResponse createParty(PartyDtos.CreatePartyRequest request) {
        CaseInfo caseInfo = caseInfoRepository.findById(request.caseId())
                .orElseThrow(() -> new NotFoundException("Case not found: " + request.caseId()));

        OffsetDateTime now = OffsetDateTime.now();
        CaseParty party = new CaseParty();
        party.setCaseInfo(caseInfo);
        party.setPartyName(request.partyName());
        party.setPartyType(request.partyType());
        party.setLegalRole(request.legalRole());
        party.setCreatedAt(now);
        party.setUpdatedAt(now);

        CaseParty saved = casePartyRepository.save(party);
        auditService.logCreate("system", "CASE_PARTY", saved.getId());
        return toPartyResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PartyDtos.PartyResponse> listParties(Long caseId) {
        return casePartyRepository.findByCaseInfo_Id(caseId).stream()
                .map(this::toPartyResponse)
                .toList();
    }

    @Transactional
    public PartyDtos.ContactResponse createContact(PartyDtos.CreateContactRequest request) {
        CaseParty party = casePartyRepository.findById(request.partyId())
                .orElseThrow(() -> new NotFoundException("Party not found: " + request.partyId()));

        OffsetDateTime now = OffsetDateTime.now();
        PartyContact contact = new PartyContact();
        contact.setCaseParty(party);
        contact.setContactType(request.contactType());
        contact.setContactValue(sensitiveCryptoService.encrypt(request.contactValue()));
        contact.setPrimary(request.isPrimary());
        contact.setCreatedAt(now);
        contact.setUpdatedAt(now);

        PartyContact saved = partyContactRepository.save(contact);
        auditService.logCreate("system", "PARTY_CONTACT", saved.getId());
        return toContactResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PartyDtos.ContactResponse> listContacts(Long partyId) {
        return partyContactRepository.findByCaseParty_Id(partyId).stream()
                .map(this::toContactResponse)
                .toList();
    }

    private PartyDtos.PartyResponse toPartyResponse(CaseParty party) {
        return new PartyDtos.PartyResponse(
                party.getId(),
                party.getCaseInfo().getId(),
                party.getPartyName(),
                party.getPartyType(),
                party.getLegalRole(),
                party.getCreatedAt(),
                party.getUpdatedAt());
    }

    private PartyDtos.ContactResponse toContactResponse(PartyContact contact) {
        String plain = sensitiveCryptoService.decrypt(contact.getContactValue());
        return new PartyDtos.ContactResponse(
                contact.getId(),
                contact.getCaseParty().getId(),
                contact.getContactType(),
            MaskingUtils.mask(contact.getContactType(), plain),
                contact.isPrimary(),
                contact.getCreatedAt(),
                contact.getUpdatedAt());
    }
}
