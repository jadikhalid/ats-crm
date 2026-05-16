package com.esn.ats.api.controller.agent.candidate;

import com.esn.ats.application.candidate.CandidateApplicationService;
import com.esn.ats.application.candidate.dto.CandidateResponse;
import com.esn.ats.domain.ai.dto.CandidateProfileDto;
import com.esn.ats.domain.ai.port.AiService;
import com.esn.ats.infrastructure.cv.CvTextExtractor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;

@RestController
@RequestMapping("/v1/agent/candidates")
@PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
@RequiredArgsConstructor
public class CandidateUploadController {

    private final CvTextExtractor cvTextExtractor;
    private final AiService aiService;
    private final CandidateApplicationService candidateApplicationService;

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CandidateResponse uploadCv(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier CV est vide.");
        }
        if (!isAllowedCvFile(file)) {
            throw new IllegalArgumentException(
                    "Format non pris en charge : envoyez un PDF ou un fichier texte (.txt).");
        }
        String extracted;
        try {
            extracted = cvTextExtractor.extract(file.getInputStream(), file.getOriginalFilename());
        } catch (IOException e) {
            throw new IllegalArgumentException("Impossible d'extraire le texte de ce fichier.");
        }
        if (!StringUtils.hasText(extracted)) {
            throw new IllegalArgumentException("Aucun texte lisible dans ce fichier pour l'ATS.");
        }
        CandidateProfileDto profile = aiService.parseCv(extracted);
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv-upload";
        return candidateApplicationService.createFromCvUpload(profile, extracted, originalFilename);
    }

    private static boolean isAllowedCvFile(MultipartFile file) {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase(Locale.ROOT) : "";
        if (name.endsWith(".pdf")) {
            return true;
        }
        if (name.endsWith(".txt") || name.endsWith(".text")) {
            return true;
        }
        String ct = file.getContentType() != null ? file.getContentType().toLowerCase(Locale.ROOT) : "";
        return ct.contains("pdf") || ct.startsWith("text/");
    }
}
