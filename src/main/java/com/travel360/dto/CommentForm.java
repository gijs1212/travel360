package com.travel360.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentForm {

    @NotBlank
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
