package com.esn.ats.infrastructure.cv;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

/**
 * Extraction de texte brut depuis flux (PDF via Tika parsers, fichiers texte, etc.).
 */
@Component
public class CvTextExtractor {

    private final Tika tika = new Tika();

    public String extract(InputStream input, String resourceNameHint) throws IOException {
        Metadata metadata = new Metadata();
        if (resourceNameHint != null && !resourceNameHint.isBlank()) {
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, resourceNameHint);
        }
        try (InputStream in = input) {
            String text = tika.parseToString(in, metadata);
            return text != null ? text.strip() : "";
        } catch (TikaException e) {
            throw new IOException("Échec extraction texte CV", e);
        }
    }
}
