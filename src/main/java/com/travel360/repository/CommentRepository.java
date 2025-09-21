package com.travel360.repository;

import com.travel360.model.Comment;
import com.travel360.model.Photo;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPhotoOrderByCreatedAtAsc(Photo photo);
}
