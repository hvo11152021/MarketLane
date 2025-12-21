package com.marketlane.backend.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.marketlane.backend.dto.ProductResponseDto;
import com.marketlane.backend.mapper.ProductMapper;
import com.marketlane.backend.model.Product;
import com.marketlane.backend.repo.ProductRepo;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepo repo;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService service;

    @Test
    void addProduct_setsImageAndAvailabilityAndSaves() throws IOException {
        Product product = new Product();
        product.setStockQuantity(0);
        product.setPrice(BigDecimal.valueOf(12.50));

        MockMultipartFile imageFile = new MockMultipartFile(
                "imageFile", "phone.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );

        when(repo.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product saved = service.addProduct(product, imageFile);

        assertThat(saved.getImageName()).isEqualTo("phone.jpg");
        assertThat(saved.getImageType()).isEqualTo("image/jpeg");
        assertThat(saved.getImageData()).containsExactly(1, 2, 3);
        assertThat(saved.isProductAvailable()).isFalse();
        verify(repo).save(product);
    }

    @Test
    void updateProduct_whenMissing_returnsNull() throws IOException {
        when(repo.findById(10)).thenReturn(Optional.empty());

        Product result = service.updateProduct(10, new Product(), null);

        assertThat(result).isNull();
        verify(repo, never()).save(any(Product.class));
    }

    @Test
    void updateProduct_updatesFieldsAndAvailabilityBasedOnStock() throws IOException {
        Product existing = new Product();
        existing.setName("Old");
        existing.setStockQuantity(1);
        existing.setProductAvailable(true);

        Product incoming = new Product();
        incoming.setName("New");
        incoming.setDescription("Updated");
        incoming.setBrand("BrandX");
        incoming.setPrice(BigDecimal.valueOf(99.99));
        incoming.setCategory("Phones");
        incoming.setStockQuantity(0);
        incoming.setProductAvailable(true);

        MockMultipartFile imageFile = new MockMultipartFile(
                "imageFile", "new.png", "image/png", new byte[]{9, 8}
        );

        when(repo.findById(5)).thenReturn(Optional.of(existing));
        when(repo.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product saved = service.updateProduct(5, incoming, imageFile);

        assertThat(saved.getName()).isEqualTo("New");
        assertThat(saved.getDescription()).isEqualTo("Updated");
        assertThat(saved.getBrand()).isEqualTo("BrandX");
        assertThat(saved.getCategory()).isEqualTo("Phones");
        assertThat(saved.getPrice()).isEqualTo(BigDecimal.valueOf(99.99));
        assertThat(saved.getStockQuantity()).isZero();
        assertThat(saved.isProductAvailable()).isFalse();
        assertThat(saved.getImageName()).isEqualTo("new.png");
        assertThat(saved.getImageType()).isEqualTo("image/png");
        assertThat(saved.getImageData()).containsExactly(9, 8);
    }

    @Test
    void searchProducts_mapsEntitiesToDtos() {
        Product product = new Product();
        ProductResponseDto dto = new ProductResponseDto();

        when(repo.findAll()).thenReturn(List.of(product));
        when(productMapper.toProductResponseDto(product)).thenReturn(dto);

        List<ProductResponseDto> results = service.searchProducts();

        assertThat(results).containsExactly(dto);
        verify(productMapper).toProductResponseDto(product);
    }
}
