package com.court.service.party;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

interface CasePartyRepository extends JpaRepository<CaseParty, Long> {

    List<CaseParty> findByCaseInfo_Id(Long caseId);
}

interface PartyContactRepository extends JpaRepository<PartyContact, Long> {

    List<PartyContact> findByCaseParty_Id(Long partyId);
}
