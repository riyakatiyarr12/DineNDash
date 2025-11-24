## Tables and Relationships
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ password        │
│ phone           │
│ role            │
│ is_active       │
│ created_at      │
│ updated_at      │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────┐
│      BOOKINGS           │
├─────────────────────────┤
│ id (PK)                 │
│ booking_reference       │
│ user_id (FK)            │───┐
│ restaurant_id (FK)      │   │
│ booking_date            │   │
│ booking_time            │   │
│ number_of_seats         │   │
│ dietary_preference_id   │   │
│ special_requests        │   │
│ status                  │   │
│ admin_notes             │   │
│ approved_by (FK)        │   │
│ approved_at             │   │
│ created_at              │   │
│ updated_at              │   │
└─────────────────────────┘   │
        │                      │
        │ N:M                  │
        ▼                      │
┌───────────────────────┐     │
│ BOOKING_MENU_ITEMS    │     │
├───────────────────────┤     │
│ id (PK)               │     │
│ booking_id (FK)       │     │
│ menu_item_id (FK)     │     │
│ quantity              │     │
│ price_at_booking      │     │
│ created_at            │     │
└───────────────────────┘     │
        │                      │
        │                      │
        ▼                      │
┌─────────────────────┐       │
│    MENU_ITEMS       │       │
├─────────────────────┤       │
│ id (PK)             │       │
│ restaurant_id (FK)  │───────┘
│ name                │
│ description         │
│ category            │
│ price               │
│ is_vegetarian       │
│ is_vegan            │
│ is_gluten_free      │
│ image_url           │
│ is_available        │
│ created_at          │
│ updated_at          │
└─────────────────────┘
        │
        │
        │
┌──────────────────────┐
│   RESTAURANTS        │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ description          │
│ address              │
│ city                 │
│ phone                │
│ email                │
│ cuisine_type         │
│ price_range          │
│ opening_time         │
│ closing_time         │
│ total_seats          │
│ image_url            │
│ rating               │
│ total_reviews        │
│ is_active            │
│ created_at           │
│ updated_at           │
└──────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│    TIME_SLOTS       │
├─────────────────────┤
│ id (PK)             │
│ restaurant_id (FK)  │
│ slot_date           │
│ slot_time           │
│ available_seats     │
│ is_available        │
│ created_at          │
└─────────────────────┘

┌────────────────────────┐
│  DIETARY_PREFERENCES   │
├────────────────────────┤
│ id (PK)                │
│ name (UNIQUE)          │
│ description            │
│ created_at             │
└────────────────────────┘
        │
        │ 1:N
        ▼
    (Referenced by BOOKINGS)

┌─────────────────────┐
│      REVIEWS        │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ restaurant_id (FK)  │
│ booking_id (FK)     │
│ rating              │
│ comment             │
│ created_at          │
│ updated_at          │
└─────────────────────┘