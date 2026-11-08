# Database diagram

Source of truth: `database/schema.sql`. SQLite, foreign keys on, money in integer cents.

```mermaid
erDiagram
  users ||--o{ sessions : "has"
  users ||--o{ orders : "places (nullable for guests)"
  categories ||--o{ products : "groups"
  orders ||--|{ order_items : "contains"
  products ||--o{ order_items : "sold as (SET NULL on delete)"

  users {
    int id PK
    text email UK
    text name
    text password_hash
    text role "admin | customer"
  }
  sessions {
    text token_hash PK
    int user_id FK
    text expires_at
  }
  categories {
    text id PK
    text label
  }
  products {
    text id PK
    text category_id FK
    text name
    int price_cents
    int stock
    text image
  }
  orders {
    text id PK
    int user_id FK
    text access_token
    text status
    int total_cents
  }
  order_items {
    int id PK
    text order_id FK
    text product_id FK
    int qty
    int unit_price_cents
  }
```

Delete rules: deleting a user removes their sessions and leaves their orders as guest orders; deleting an order removes its lines; deleting a product keeps order lines (name and price are copied at purchase time); a category cannot be deleted while products use it. Every foreign key column has an index.
