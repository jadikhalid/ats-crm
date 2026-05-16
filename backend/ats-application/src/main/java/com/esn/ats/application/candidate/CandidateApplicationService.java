package com.esn.ats.application.candidate;

import com.esn.ats.application.candidate.dto.CandidateRequest;
import com.esn.ats.application.candidate.dto.CandidateResponse;
import com.esn.ats.common.exception.ResourceNotFoundException;
import com.esn.ats.domain.ai.dto.CandidateProfileDto;
import com.esn.ats.domain.candidate.model.Candidate;
import com.esn.ats.domain.candidate.model.CandidateStatus;
import com.esn.ats.domain.candidate.port.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CandidateApplicationService {

    private static final Pattern SIMPLE_EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final CandidateRepository candidateRepository;

    @Transactional(readOnly = true)
    public List<CandidateResponse> findAll() {
        return candidateRepository.findAll().stream()
                .map(c -> toResponse(c, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public CandidateResponse findById(Long id) {
        Candidate candidate =
                candidateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable : " + id));
        return toResponse(candidate, true);
    }

    @Transactional
    public CandidateResponse create(CandidateRequest request) {
        if (candidateRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Un candidat avec cet email existe déjà");
        }
        Candidate candidate = new Candidate(
                null,
                request.firstName(),
                request.lastName(),
                request.email(),
                blankToNull(request.phone()),
                blankToNull(request.cvPath()),
                null,
                null,
                request.skills() != null ? List.copyOf(request.skills()) : List.of(),
                request.status());
        return toResponse(candidateRepository.save(candidate), false);
    }

    /**
     * Crée un candidat à partir du profil IA + texte source extrait du fichier CV.
     */
    @Transactional
    public CandidateResponse createFromCvUpload(CandidateProfileDto profile, String extractedPlainText, String originalFilename) {
        String emailRaw = sanitizeSingleLine(profile.email());
        if (!StringUtils.hasText(emailRaw) || emailRaw.contains(" ") || !SIMPLE_EMAIL.matcher(emailRaw).matches()) {
            throw new IllegalArgumentException(
                    "Adresse email absente ou illisible dans le CV : corrigez le fichier ou créez le candidat manuellement.");
        }
        if (candidateRepository.existsByEmail(emailRaw)) {
            throw new IllegalArgumentException("Un candidat avec l'email « " + emailRaw + " » existe déjà dans l'ATS.");
        }
        String firstName = sanitizeName(orPlaceholder(profile.firstName(), "À compléter"));
        String lastName = sanitizeName(orPlaceholder(profile.lastName(), "CV"));
        String cvPathSuffix = shortenFilename(originalFilename, 480);

        Candidate candidate =
                new Candidate(
                        null,
                        firstName,
                        lastName,
                        emailRaw,
                        blankToNull(sanitizeSingleLine(profile.phone())),
                        cvPathSuffix != null ? "upload/" + cvPathSuffix : null,
                        StringUtils.hasText(extractedPlainText) ? extractedPlainText : null,
                        blankToNull(profile.summary()),
                        profile.skills() != null ? List.copyOf(profile.skills()) : List.of(),
                        CandidateStatus.NEW);
        return toResponse(candidateRepository.save(candidate), false);
    }

    @Transactional
    public CandidateResponse update(Long id, CandidateRequest request) {
        Candidate existing = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable : " + id));
        if (candidateRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new IllegalArgumentException("Un candidat avec cet email existe déjà");
        }
        Candidate updated = new Candidate(
                existing.id(),
                request.firstName(),
                request.lastName(),
                request.email(),
                blankToNull(request.phone()),
                blankToNull(request.cvPath()),
                existing.cvContent(),
                existing.profileSummary(),
                request.skills() != null ? List.copyOf(request.skills()) : List.of(),
                request.status());
        return toResponse(candidateRepository.save(updated), false);
    }

    @Transactional
    public void delete(Long id) {
        if (!candidateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Candidat introuvable : " + id);
        }
        candidateRepository.deleteById(id);
    }

    private CandidateResponse toResponse(Candidate candidate, boolean includeHeavyFields) {
        return new CandidateResponse(
                candidate.id(),
                candidate.firstName(),
                candidate.lastName(),
                candidate.email(),
                candidate.phone(),
                candidate.cvPath(),
                includeHeavyFields ? candidate.cvContent() : null,
                includeHeavyFields ? candidate.profileSummary() : null,
                candidate.skills(),
                candidate.status());
    }

    private static String sanitizeName(String s) {
        if (!StringUtils.hasText(s)) {
            return "";
        }
        String t = s.strip();
        return t.length() > 100 ? t.substring(0, 100) : t;
    }

    private static String sanitizeSingleLine(String s) {
        if (!StringUtils.hasText(s)) {
            return "";
        }
        return s.replace("\r", " ").replace("\n", " ").strip();
    }

    private static String orPlaceholder(String value, String fallback) {
        if (!StringUtils.hasText(value != null ? value.strip() : null)) {
            return fallback;
        }
        return value.strip();
    }

    private static String blankToNull(String s) {
        return StringUtils.hasText(s) ? s.strip() : null;
    }

    /** Nom de fichier fichier.pdf → max {@code maxLen}. */
    private static String shortenFilename(String name, int maxLen) {
        if (!StringUtils.hasText(name)) {
            return null;
        }
        String base = sanitizeSingleLine(name).replace('\\', '/');
        int slash = base.lastIndexOf('/');
        if (slash >= 0 && slash < base.length() - 1) {
            base = base.substring(slash + 1);
        }
        return base.length() > maxLen ? base.substring(0, maxLen) : base;
    }
}
