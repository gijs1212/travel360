package com.travel360.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PhotoStorageService {

    private final StorageProperties properties;

    public PhotoStorageService(StorageProperties properties) {
        this.properties = properties;
        ensureRootExists();
    }

    public String store(UUID tripId, MultipartFile file) throws IOException {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        if (!StringUtils.hasText(filename)) {
            filename = "photo-" + UUID.randomUUID();
        }
        Path directory = Paths.get(properties.getRoot(), tripId.toString());
        Files.createDirectories(directory);
        Path destination = directory.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return destination.toString().replace("\\", "/");
    }

    public Path resolve(String storagePath) {
        return Paths.get(storagePath);
    }

    public String publicUrl(String storagePath) {
        Path path = Paths.get(storagePath);
        Path relative = Paths.get(properties.getRoot()).relativize(path);
        return properties.getBaseUrl() + "/" + relative.toString().replace("\\", "/");
    }

    public void delete(String storagePath) {
        if (storagePath == null) {
            return;
        }
        try {
            Files.deleteIfExists(Paths.get(storagePath));
        } catch (IOException ignored) {
        }
    }

    private void ensureRootExists() {
        try {
            Files.createDirectories(Paths.get(properties.getRoot()));
        } catch (IOException ignored) {
        }
    }
}
