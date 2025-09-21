package com.travel360.controller;

import com.travel360.dto.PhotoForm;
import com.travel360.dto.TripForm;
import com.travel360.model.Profile;
import com.travel360.model.Trip;
import com.travel360.service.PhotoStorageService;
import com.travel360.service.ProfileService;
import com.travel360.service.TripService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.security.Principal;
import java.util.UUID;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    private final TripService tripService;
    private final ProfileService profileService;
    private final PhotoStorageService storageService;

    public DashboardController(TripService tripService, ProfileService profileService, PhotoStorageService storageService) {
        this.tripService = tripService;
        this.profileService = profileService;
        this.storageService = storageService;
    }

    @GetMapping
    public String dashboard(Model model, Principal principal) {
        Profile uploader = profileService.findByUsername(principal.getName()).orElseThrow();
        model.addAttribute("trips", tripService.findByUploader(uploader));
        if (!model.containsAttribute("tripForm")) {
            model.addAttribute("tripForm", new TripForm());
        }
        model.addAttribute("storage", storageService);
        return "dashboard";
    }

    @PostMapping("/trip")
    public String createTrip(@Valid @ModelAttribute("tripForm") TripForm form,
                              BindingResult result,
                              Principal principal,
                              RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.tripForm", result);
            redirectAttributes.addFlashAttribute("tripForm", form);
            redirectAttributes.addFlashAttribute("error", "Controleer de invoer en probeer opnieuw.");
            return "redirect:/dashboard";
        }
        Profile uploader = profileService.findByUsername(principal.getName()).orElseThrow();
        Trip trip = tripService.saveTrip(uploader, form);
        redirectAttributes.addFlashAttribute("success", "Reis opgeslagen.");
        return "redirect:/dashboard/trip/" + trip.getId();
    }

    @GetMapping("/trip/{id}")
    public String manageTrip(@PathVariable UUID id, Model model) {
        Trip trip = tripService.findTripWithPhotos(id);
        model.addAttribute("trip", trip);
        model.addAttribute("photos", tripService.listPhotos(trip));
        if (!model.containsAttribute("photoForm")) {
            model.addAttribute("photoForm", new PhotoForm());
        }
        if (!model.containsAttribute("tripForm")) {
            model.addAttribute("tripForm", toForm(trip));
        }
        model.addAttribute("storage", storageService);
        return "dashboard-trip";
    }

    @PostMapping("/trip/{id}")
    public String updateTrip(@PathVariable UUID id,
                              @Valid @ModelAttribute("tripForm") TripForm form,
                              BindingResult result,
                              Principal principal,
                              RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.tripForm", result);
            redirectAttributes.addFlashAttribute("tripForm", form);
            redirectAttributes.addFlashAttribute("error", "Controleer de invoer en probeer opnieuw.");
            return "redirect:/dashboard/trip/" + id;
        }
        Profile uploader = profileService.findByUsername(principal.getName()).orElseThrow();
        form.setId(id.toString());
        tripService.saveTrip(uploader, form);
        redirectAttributes.addFlashAttribute("success", "Reis bijgewerkt.");
        return "redirect:/dashboard/trip/" + id;
    }

    @PostMapping("/trip/{id}/delete")
    public String deleteTrip(@PathVariable UUID id, RedirectAttributes redirectAttributes) {
        tripService.deleteTrip(id);
        redirectAttributes.addFlashAttribute("success", "Reis verwijderd.");
        return "redirect:/dashboard";
    }

    @PostMapping("/trip/{id}/photos")
    public String uploadPhoto(@PathVariable UUID id,
                               @Valid @ModelAttribute("photoForm") PhotoForm form,
                               BindingResult result,
                               Principal principal,
                               RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            redirectAttributes.addFlashAttribute("org.springframework.validation.BindingResult.photoForm", result);
            redirectAttributes.addFlashAttribute("photoForm", form);
            redirectAttributes.addFlashAttribute("error", "Upload mislukt. Controleer het formulier.");
            return "redirect:/dashboard/trip/" + id;
        }
        Trip trip = tripService.findTrip(id);
        Profile uploader = profileService.findByUsername(principal.getName()).orElseThrow();
        try {
            tripService.addPhoto(uploader, trip, form);
            redirectAttributes.addFlashAttribute("success", "Foto toegevoegd.");
        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("error", "Kon foto niet opslaan: " + e.getMessage());
        }
        return "redirect:/dashboard/trip/" + id;
    }

    @PostMapping("/trip/{tripId}/photos/{photoId}/delete")
    public String deletePhoto(@PathVariable UUID tripId,
                               @PathVariable UUID photoId,
                               RedirectAttributes redirectAttributes) {
        tripService.deletePhoto(photoId);
        redirectAttributes.addFlashAttribute("success", "Foto verwijderd.");
        return "redirect:/dashboard/trip/" + tripId;
    }

    private TripForm toForm(Trip trip) {
        TripForm form = new TripForm();
        form.setId(trip.getId().toString());
        form.setTitle(trip.getTitle());
        form.setDescription(trip.getDescription());
        form.setStartDate(trip.getStartDate());
        form.setEndDate(trip.getEndDate());
        form.setPolarstepsUrl(trip.getPolarstepsUrl());
        return form;
    }
}
