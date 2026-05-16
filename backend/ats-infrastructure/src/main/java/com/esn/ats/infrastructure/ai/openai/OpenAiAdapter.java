package com.esn.ats.infrastructure.ai.openai;

import com.esn.ats.common.exception.AiIntegrationException;
import com.esn.ats.domain.ai.dto.CandidateProfileDto;
import com.esn.ats.domain.ai.dto.MatchingResultDto;
import com.esn.ats.domain.ai.port.AiService;
import com.esn.ats.domain.candidate.model.Candidate;
import com.esn.ats.domain.opportunity.model.Opportunity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class OpenAiAdapter implements AiService {

    private static final Duration HTTP_TIMEOUT = Duration.ofSeconds(120);

    private final OpenAiProperties properties;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OpenAiAdapter(OpenAiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        String root = normalizeBaseUrl(properties.baseUrl());
        this.webClient = WebClient.builder()
                .baseUrl(root)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiKey().trim())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private static String normalizeBaseUrl(String baseUrl) {
        if (baseUrl.endsWith("/")) {
            return baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }

    @Override
    public CandidateProfileDto parseCv(String cvText) {
        requireApiKeyConfigured();
        if (!StringUtils.hasText(cvText)) {
            throw new IllegalArgumentException("Le texte du CV est obligatoire.");
        }
        String userMessage = """
                ## Texte brut du CV (source unique)

                %s

                Produis uniquement l'objet JSON demandé.
                """.formatted(cvText.strip());
        Map<String, Object> responseFormat = CandidateProfileStructuredOutputSchema.candidateProfileResponseFormat();
        String json = invokeChat(OpenAiJsonPrompts.SYSTEM_PARSE_CV, userMessage, responseFormat);
        try {
            return objectMapper.readValue(json, CandidateProfileDto.class);
        } catch (Exception e) {
            log.warn("Réponse IA parse CV non désérialisable brut={}", truncate(json));
            throw new AiIntegrationException("Impossible de convertir la réponse OpenAI pour le parsing CV.", e);
        }
    }

    @Override
    public MatchingResultDto scoreCandidateAgainstOpportunity(Candidate candidate, Opportunity opportunity) {
        requireApiKeyConfigured();
        String candidateBlock = buildCandidateBlock(candidate);
        String oppBlock = buildOpportunityBlock(opportunity);
        String userMessage = candidateBlock + "\n\n" + oppBlock;
        Map<String, Object> responseFormat = MatchingStructuredOutputSchema.matchingResponseFormat();
        String json = invokeChat(OpenAiJsonPrompts.SYSTEM_MATCH_SCORE, userMessage, responseFormat);
        try {
            MatchingResultDto raw = objectMapper.readValue(json, MatchingResultDto.class);
            int score = Math.clamp(raw.score(), 0, 100);
            return new MatchingResultDto(score, raw.strengths(), raw.weaknesses());
        } catch (Exception e) {
            log.warn("Réponse IA matching non désérialisable brut={}", truncate(json));
            throw new AiIntegrationException("Impossible de convertir la réponse OpenAI pour le matching.", e);
        }
    }

    private String buildCandidateBlock(Candidate candidate) {
        List<String> skills = candidate.skills();
        String skillsLine = skills == null ? "" : skills.stream().sorted().collect(Collectors.joining(", "));
        return """
                ## CANDIDAT (données de référence — ne pas inventer au-delà du texte suivant et des listes ci-dessous)
                id: %d
                prénom: %s
                nom: %s
                email: %s
                téléphone: %s
                statut ATS: %s
                compétences en base ATS: [%s]
                """.formatted(
                candidate.id(),
                sanitize(candidate.firstName()),
                sanitize(candidate.lastName()),
                sanitize(candidate.email()),
                sanitize(candidate.phone()),
                candidate.status(),
                skillsLine);
    }

    private String buildOpportunityBlock(Opportunity opportunity) {
        return """
                ## OPPORTUNITÉ
                id: %d
                titre: %s
                description / fiche: %s
                profil recherché: %s
                statut: %s
                budget (hint): %s
                clientId: %d
                """.formatted(
                opportunity.id(),
                sanitize(opportunity.title()),
                sanitize(opportunity.description()),
                sanitize(opportunity.profileSought()),
                opportunity.status(),
                opportunity.budget() != null ? opportunity.budget().toPlainString() : "non renseigné",
                opportunity.clientId());
    }

    private String sanitize(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\r\n", "\n").strip();
    }

    private String invokeChat(String systemPrompt, String userMessage, Map<String, Object> responseFormat) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", properties.model());
        body.put("temperature", properties.temperature());
        body.put("response_format", responseFormat);
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userMessage)));

        Mono<String> response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.isError(), resp ->
                        resp.bodyToMono(String.class)
                                .defaultIfEmpty("")
                                .flatMap(payload -> Mono.error(new AiIntegrationException(
                                        "Erreur OpenAI HTTP %s : %s".formatted(resp.statusCode(), truncate(payload)))))
                )
                .bodyToMono(String.class);

        try {
            String raw = response.block(HTTP_TIMEOUT);
            if (!StringUtils.hasText(raw)) {
                throw new AiIntegrationException("Réponse OpenAI vide.");
            }
            JsonNode root = objectMapper.readTree(raw);
            if (root.has("error")) {
                String msg = root.path("error").path("message").asText("Erreur inconnue OpenAI.");
                throw new AiIntegrationException("OpenAI : " + msg);
            }
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (!StringUtils.hasText(content)) {
                throw new AiIntegrationException("Contenu IA absent dans la réponse OpenAI.");
            }
            return extractJson(content);
        } catch (AiIntegrationException e) {
            throw e;
        } catch (Exception e) {
            throw new AiIntegrationException("Échec d'appel à l'API OpenAI.", e);
        }
    }

    /**
     * Retire fences Markdown éventuels tout en conservant un unique objet JSON.
     */
    static String extractJson(String content) {
        String trimmed = content.strip();
        if (trimmed.startsWith("```")) {
            int start = trimmed.indexOf('{');
            int end = trimmed.lastIndexOf('}');
            if (start >= 0 && end > start) {
                return trimmed.substring(start, end + 1).strip();
            }
        }
        return trimmed;
    }

    static String truncate(String s) {
        if (s == null) {
            return "";
        }
        if (s.length() <= 700) {
            return s;
        }
        return s.substring(0, 700) + "…";
    }

    private void requireApiKeyConfigured() {
        if (!StringUtils.hasText(properties.apiKey())) {
            throw new AiIntegrationException(
                    "Clé OpenAI absente — définissez OPENAI_API_KEY ou app.ai.openai.api-key.");
        }
    }
}
