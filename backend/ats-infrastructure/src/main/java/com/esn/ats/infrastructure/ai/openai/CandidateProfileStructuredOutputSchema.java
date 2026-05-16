package com.esn.ats.infrastructure.ai.openai;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Schéma JSON Structured Outputs pour le parsing CV ({@link com.esn.ats.domain.ai.dto.CandidateProfileDto}).
 */
final class CandidateProfileStructuredOutputSchema {

    static Map<String, Object> candidateProfileResponseFormat() {
        return Map.of(
                "type", "json_schema",
                "json_schema", candidateProfileJsonSchemaObject());
    }

    private static Map<String, Object> candidateProfileJsonSchemaObject() {
        Map<String, Object> str = Map.of(
                "type", "string",
                "description", "Valeurs littérales tirées du texte utilisateur lorsque disponibles.");

        Map<String, Object> skillItems = new LinkedHashMap<>();
        skillItems.put("type", "string");
        skillItems.put("description", "Compétence métier ou technique courte, sans doublon évident.");

        Map<String, Object> skills = new LinkedHashMap<>();
        skills.put("type", "array");
        skills.put(
                "description",
                "Compétences pertinentes pour un ATS ESN, normalisées (Java, Angular, Agile…). Vide si aucune identifiable.");
        skills.put("items", skillItems);

        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("firstName", str);
        properties.put("lastName", str);
        properties.put(
                "email",
                Map.of(
                        "type",
                        "string",
                        "description",
                        "Adresse email extraite ou chaîne vide si absente."));
        properties.put(
                "phone",
                Map.of(
                        "type",
                        "string",
                        "description",
                        "Téléphone / mobile tel que dans le CV, ou chaîne vide."));
        properties.put(
                "summary",
                Map.of(
                        "type",
                        "string",
                        "description",
                        "Synthèse professionnelle en français (2 à 6 phrases), factuelle."));
        properties.put("skills", skills);

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", properties);
        schema.put("required", List.of("firstName", "lastName", "email", "phone", "skills", "summary"));
        schema.put("additionalProperties", Boolean.FALSE);

        Map<String, Object> jsonSchema = new LinkedHashMap<>();
        jsonSchema.put("name", "candidate_cv_profile");
        jsonSchema.put("strict", Boolean.TRUE);
        jsonSchema.put("schema", schema);
        return jsonSchema;
    }

    private CandidateProfileStructuredOutputSchema() {
    }
}
