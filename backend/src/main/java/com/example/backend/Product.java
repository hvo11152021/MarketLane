@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String descriptionl;
    private DigDecimal price;

    // Getters and setters
    
}