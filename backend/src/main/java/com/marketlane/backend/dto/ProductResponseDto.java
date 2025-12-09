package com.marketlane.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class ProductResponseDto {
    private int id;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private String category;
    private Date releaseDate;
    private boolean productAvailable;
    private int stockQuantity;
    private String imageName;
    private String imageType;
    private byte[] imageData;
}
