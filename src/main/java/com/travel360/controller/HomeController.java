package com.travel360.controller;

import com.travel360.dto.CommentForm;
import com.travel360.model.Photo;
import com.travel360.model.Profile;
import com.travel360.model.Trip;
import com.travel360.service.PhotoStorageService;
import com.travel360.service.ProfileService;
import com.travel360.service.TripService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping
public class HomeController {

    private final TripService tripService;
    private final ProfileService profileService;
    private final PhotoStorageService storageService;

    public HomeController(TripService tripService, ProfileService profileService, PhotoStorageService storageService) {
        this.tripService = tripService;
        this.profileService = profileService;
        this.storageService = storageService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("trips", tripService.findAllTrips());
        model.addAttribute("storage", storageService);
        return "home";
    }

    @GetMapping("/trip/{id}")
    public String tripDetail(@PathVariable UUID id, Model model) {
        Trip trip = tripService.findTripWithPhotos(id);
        List<Photo> photos = tripService.listPhotos(trip);
        model.addAttribute("trip", trip);
        model.addAttribute("photos", photos);
        model.addAttribute("storage", storageService);
        model.addAttribute("commentForm", new CommentForm());
        return "trip-detail";
    }

    @PostMapping("/trip/{tripId}/photo/{photoId}/comment")
    public String addComment(@PathVariable UUID tripId,
                             @PathVariable UUID photoId,
                             @Valid @ModelAttribute("commentForm") CommentForm form,
                             BindingResult result,
                             Principal principal,
                             Model model) {
        Trip trip = tripService.findTripWithPhotos(tripId);
        Photo photo = trip.getPhotos().stream()
                .filter(p -> p.getId().equals(photoId))
                .findFirst()
                .orElseThrow();

        if (principal == null) {
            result.rejectValue("content", "notAuthenticated", "Je moet ingelogd zijn om een reactie te plaatsen.");
        }

        if (result.hasErrors()) {
            model.addAttribute("trip", trip);
            model.addAttribute("photos", tripService.listPhotos(trip));
            model.addAttribute("storage", storageService);
            model.addAttribute("commentForm", form);
            model.addAttribute("errorPhotoId", photoId);
            return "trip-detail";
        }

        Profile author = profileService.findByUsername(principal.getName()).orElseThrow();
        tripService.addComment(author, photo, form.getContent());
        return "redirect:/trip/" + tripId + "#photo-" + photoId;
    }
}
