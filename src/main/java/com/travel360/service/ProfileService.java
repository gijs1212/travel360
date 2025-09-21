package com.travel360.service;

import com.travel360.dto.RegistrationRequest;
import com.travel360.model.Profile;
import com.travel360.model.Role;
import com.travel360.repository.ProfileRepository;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(ProfileRepository profileRepository, PasswordEncoder passwordEncoder) {
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<Profile> findByUsername(String username) {
        return profileRepository.findByUsernameIgnoreCase(username);
    }

    public Optional<Profile> findByEmail(String email) {
        return profileRepository.findByEmailIgnoreCase(email);
    }

    public boolean usernameTaken(String username) {
        return profileRepository.existsByUsernameIgnoreCase(username);
    }

    public boolean emailTaken(String email) {
        return profileRepository.existsByEmailIgnoreCase(email);
    }

    @Transactional
    public Profile registerCommenter(RegistrationRequest request) {
        Profile profile = new Profile();
        profile.setUsername(request.getUsername());
        profile.setEmail(request.getEmail());
        profile.setPassword(passwordEncoder.encode(request.getPassword()));
        profile.setRole(Role.COMMENTER);
        return profileRepository.save(profile);
    }

    @Transactional
    public Profile createUploaderIfMissing(String username, String email, String rawPassword) {
        return profileRepository.findByUsernameIgnoreCase(username).orElseGet(() -> {
            Profile profile = new Profile();
            profile.setUsername(username);
            profile.setEmail(email);
            profile.setPassword(passwordEncoder.encode(rawPassword));
            profile.setRole(Role.UPLOADER);
            return profileRepository.save(profile);
        });
    }
}
