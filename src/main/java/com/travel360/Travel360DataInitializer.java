package com.travel360;

import com.travel360.model.Profile;
import com.travel360.model.Role;
import com.travel360.repository.ProfileRepository;
import com.travel360.service.ProfileService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class Travel360DataInitializer {

    private final ProfileService profileService;
    private final ProfileRepository profileRepository;

    public Travel360DataInitializer(ProfileService profileService, ProfileRepository profileRepository) {
        this.profileService = profileService;
        this.profileRepository = profileRepository;
    }

    @PostConstruct
    public void seedUploader() {
        profileService.createUploaderIfMissing("Gijs", "gijs@example.com", "Gijs1212");
        profileRepository.findByUsernameIgnoreCase("Gijs").ifPresent(profile -> {
            if (profile.getRole() != Role.UPLOADER) {
                profile.setRole(Role.UPLOADER);
                profileRepository.save(profile);
            }
        });
    }
}
