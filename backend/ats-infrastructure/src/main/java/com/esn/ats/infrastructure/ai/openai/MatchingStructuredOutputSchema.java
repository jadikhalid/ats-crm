package com.esn.ats.infrastructure.ai.openai;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Schéma JSON pour {@code response_format.type = json_schema} (Structured Outputs OpenAI).
 */
final class MatchingStructuredOutputSchema {

    static Map<String, Object> matchingResponseFormat() {
        return Map.of(
                "type", "json_schema",
                "json_schema", matchingJsonSchemaObject());
    }

    private static Map<String, Object> matchingJsonSchemaObject() {
        Map<String, Object> stringItem = Map.of(
                "type", "string",
                "description", "Une ligne courte et factuelle en français.");

        Map<String, Object> stringArrayProp = new LinkedHashMap<>();
        stringArrayProp.put("type", "array");
        stringArrayProp.put("description", "Points forts courts (français), une ligne par élément.");
        stringArrayProp.put("items", stringItem);

        Map<String, Object> weaknessesProp = new LinkedHashMap<>();
        weaknessesProp.put("type", "array");
        weaknessesProp.put("description", "Points d'attention, lacunes ou écarts (français), une ligne par élément.");
        weaknessesProp.put("items", Map.of(
                "type", "string",
                "description", "Une ligne courte et factuelle en français."));

        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("score", Map.of(
                "type", "integer",
                "minimum", 0,
                "maximum", 100,
                "description", "Score d'adéquation globale entre 0 et 100 inclus."));
        properties.put("strengths", stringArrayProp);
        properties.put("weaknesses", weaknessesProp);

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", properties);
        schema.put("required", List.of("score", "strengths", "weaknesses"));
        schema.put("additionalProperties", Boolean.FALSE);

        Map<String, Object> jsonSchema = new LinkedHashMap<>();
        jsonSchema.put("name", "matching_result");
        jsonSchema.put("strict", Boolean.TRUE);
        jsonSchema.put("schema", schema);
        return jsonSchema;
    }

    private MatchingStructuredOutputSchema() {
    }
}
