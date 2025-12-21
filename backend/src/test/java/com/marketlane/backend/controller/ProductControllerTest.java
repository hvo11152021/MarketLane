package com.marketlane.backend.controller;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import com.marketlane.backend.model.Product;
import com.marketlane.backend.service.ProductService;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService service;

    @InjectMocks
    private ProductController controller;

    @Test
    void getAllProducts_withCategory_usesCategorySearch() {
        Product product = new Product();
        when(service.getProductsByCategory("books")).thenReturn(List.of(product));

        ResponseEntity<List<Product>> response = controller.getAllProducts("books");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(product);
        verify(service).getProductsByCategory("books");
        verify(service, never()).getAllProducts();
    }

    @Test
    void getAllProducts_withoutCategory_returnsAll() {
        when(service.getAllProducts()).thenReturn(List.of());

        ResponseEntity<List<Product>> response = controller.getAllProducts(null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
        verify(service).getAllProducts();
    }

    @Test
    void getProduct_whenMissing_returnsNotFound() {
        when(service.getProductById(42)).thenReturn(null);

        ResponseEntity<Product> response = controller.getProduct(42);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void addProduct_whenServiceThrows_returnsServerError() throws IOException {
        Product product = new Product();
        MockMultipartFile file = new MockMultipartFile("imageFile", "p.png", "image/png", new byte[]{1});
        when(service.addProduct(any(Product.class), any())).thenThrow(new IOException("boom"));

        ResponseEntity<?> response = controller.addProduct(product, file);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isEqualTo("boom");
    }

    @Test
    void updateProduct_whenServiceReturnsNull_returnsBadRequest() throws IOException {
        when(service.updateProduct(eq(5), any(Product.class), any())).thenReturn(null);

        ResponseEntity<String> response = controller.updateProduct(5, new Product(), null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Failed to update");
    }

    @Test
    void updateProduct_whenServiceReturnsProduct_returnsOk() throws IOException {
        when(service.updateProduct(eq(5), any(Product.class), any())).thenReturn(new Product());

        ResponseEntity<String> response = controller.updateProduct(5, new Product(), null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Updated");
    }

    @Test
    void deleteProduct_whenExisting_deletesAndReturnsOk() {
        when(service.getProductById(7)).thenReturn(new Product());

        ResponseEntity<String> response = controller.deleteProduct(7);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(service).deleteProduct(7);
    }

    @Test
    void deleteProduct_whenMissing_returnsNotFound() {
        when(service.getProductById(7)).thenReturn(null);

        ResponseEntity<String> response = controller.deleteProduct(7);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(service, never()).deleteProduct(anyInt());
    }
}
