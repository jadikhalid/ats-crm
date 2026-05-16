package com.esn.ats.infrastructure.ai.openai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ai.openai")
public record OpenAiProperties(
        String apiKey,
        String baseUrl,
        String model,
        Float temperature
) {
    public OpenAiProperties {
        if (apiKey == null) {
            apiKey = "";
        }
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://api.openai.com/v1";
        }
        if (model == null || model.isBlank()) {
            model = "gpt-4o-mini";
        }
        if (temperature == null) {
            temperature = 0.2f;
        }
    }
}
