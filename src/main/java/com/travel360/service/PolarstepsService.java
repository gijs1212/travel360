package com.travel360.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PolarstepsService {

    public String deriveEmbedUrl(String input) {
        if (!StringUtils.hasText(input)) {
            return null;
        }
        String trimmed = input.trim();
        if (trimmed.contains("/embed/")) {
            return trimmed;
        }
        if (trimmed.startsWith("http")) {
            String withoutProtocol = trimmed.replace("https://", "").replace("http://", "");
            int slashIndex = withoutProtocol.indexOf('/');
            if (slashIndex > 0 && slashIndex + 1 < withoutProtocol.length()) {
                String slug = withoutProtocol.substring(slashIndex + 1);
                return "https://www.polarsteps.com/embed/" + slug;
            }
        }
        return null;
    }
}
