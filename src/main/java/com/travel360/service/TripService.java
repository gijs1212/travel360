package com.travel360.service;

import com.travel360.dto.PhotoForm;
import com.travel360.dto.TripForm;
import com.travel360.model.Comment;
import com.travel360.model.Photo;
import com.travel360.model.Profile;
import com.travel360.model.Trip;
import com.travel360.repository.CommentRepository;
import com.travel360.repository.PhotoRepository;
import com.travel360.repository.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final PhotoRepository photoRepository;
    private final CommentRepository commentRepository;
    private final PhotoStorageService storageService;
    private final PolarstepsService polarstepsService;

    public TripService(TripRepository tripRepository,
                       PhotoRepository photoRepository,
                       CommentRepository commentRepository,
                       PhotoStorageService storageService,
                       PolarstepsService polarstepsService) {
        this.tripRepository = tripRepository;
        this.photoRepository = photoRepository;
        this.commentRepository = commentRepository;
        this.storageService = storageService;
        this.polarstepsService = polarstepsService;
    }

    public List<Trip> findAllTrips() {
        return tripRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Trip> findByUploader(Profile uploader) {
        return tripRepository.findByCreatedBy(uploader);
    }

    public Trip findTrip(UUID id) {
        return tripRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Trip not found"));
    }

    public Trip findTripWithPhotos(UUID id) {
        return tripRepository.findWithPhotosById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trip not found"));
    }

    public List<Photo> listPhotos(Trip trip) {
        List<Photo> photos = photoRepository.findByTripOrderByCreatedAtAsc(trip);
        photos.forEach(photo -> photo.setComments(commentRepository.findByPhotoOrderByCreatedAtAsc(photo)));
        return photos;
    }

    @Transactional
    public Trip saveTrip(Profile uploader, @Valid TripForm form) {
        Trip trip;
        if (form.getId() != null && !form.getId().isEmpty()) {
            trip = tripRepository.findById(UUID.fromString(form.getId()))
                    .orElseThrow(() -> new EntityNotFoundException("Trip not found"));
        } else {
            trip = new Trip();
            trip.setCreatedBy(uploader);
        }
        trip.setTitle(form.getTitle());
        trip.setDescription(form.getDescription());
        trip.setStartDate(form.getStartDate());
        trip.setEndDate(form.getEndDate());
        trip.setPolarstepsUrl(form.getPolarstepsUrl());
        trip.setPolarstepsEmbedUrl(polarstepsService.deriveEmbedUrl(form.getPolarstepsUrl()));
        return tripRepository.save(trip);
    }

    @Transactional
    public void deleteTrip(UUID id) {
        tripRepository.findWithPhotosById(id).ifPresent(trip -> {
            trip.getPhotos().forEach(photo -> storageService.delete(photo.getStoragePath()));
            tripRepository.delete(trip);
        });
    }

    @Transactional
    public Photo addPhoto(Profile uploader, Trip trip, PhotoForm form) throws IOException {
        String path = storageService.store(trip.getId(), form.getFile());
        Photo photo = new Photo();
        photo.setTrip(trip);
        photo.setStoragePath(path);
        photo.setTitle(form.getTitle());
        photo.setDay(form.getDay());
        photo.setDescription(form.getDescription());
        photo.setIs360(form.isIs360());
        photo.setCreatedBy(uploader);
        Photo saved = photoRepository.save(photo);
        trip.getPhotos().add(saved);
        return saved;
    }

    @Transactional
    public void deletePhoto(UUID id) {
        photoRepository.findById(id).ifPresent(photo -> {
            storageService.delete(photo.getStoragePath());
            photoRepository.delete(photo);
        });
    }

    @Transactional
    public Comment addComment(Profile author, Photo photo, String content) {
        Comment comment = new Comment();
        comment.setAuthor(author);
        comment.setPhoto(photo);
        comment.setContent(content);
        Comment saved = commentRepository.save(comment);
        photo.getComments().add(saved);
        return saved;
    }
}
