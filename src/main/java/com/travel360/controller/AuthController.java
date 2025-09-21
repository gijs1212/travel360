package com.travel360.controller;

import com.travel360.dto.RegistrationRequest;
import com.travel360.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AuthController {

    private final ProfileService profileService;

    public AuthController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        if (!model.containsAttribute("registrationRequest")) {
            model.addAttribute("registrationRequest", new RegistrationRequest());
        }
        return "register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("registrationRequest") RegistrationRequest request,
                           BindingResult result,
                           RedirectAttributes redirectAttributes) {
        if (profileService.usernameTaken(request.getUsername())) {
            result.rejectValue("username", "username.exists", "Gebruikersnaam is al in gebruik");
        }
        if (profileService.emailTaken(request.getEmail())) {
            result.rejectValue("email", "email.exists", "E-mailadres is al in gebruik");
        }
        if (result.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.registrationRequest", result);
            redirectAttributes.addFlashAttribute("registrationRequest", request);
            return "redirect:/register";
        }
        profileService.registerCommenter(request);
        redirectAttributes.addFlashAttribute("success", "Account aangemaakt. Je kunt nu inloggen.");
        return "redirect:/login";
    }
}
