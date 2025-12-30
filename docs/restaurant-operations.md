# Restaurant Operations System

## Overview
Complete restaurant management system with advanced table management, payment processing, and high-pressure optimizations.

## Features

### 1. Dynamic Table Configuration
- Configure 1-200 tables
- Custom prefixes ("Mesa", "Table", etc.)
- Color-coded sections (Salão, Varanda, VIP)
- Real-time preview

**Location:** Settings > Mesas & Layout

### 2. Ultrafast Algorithms (< 1ms)
All critical operations use deterministic algorithms instead of AI for maximum speed:

| Algorithm | Performance | Use Case |
|---|---|---|
| Cash Calculator | 0.1ms | Change calculation |
| Upsell Engine | 0.5ms | Product suggestions |
| Table Priority | 1ms | Table prioritization |
| Bill Splitter | 0.3ms | Split bill |
| Order Router | 0.2ms | Kitchen routing |

### 3. Table Management
- Merge multiple tables for large groups
- Split bills (equal, by item, custom)
- Individual payments per person
- Table priority scoring
- Occupancy tracking

### 4. Payment on Waiter Tablet
Waiters can close tables directly on their device:
- Cash, Card, PIX, Voucher support
- Automatic change calculation
- Receipt printing
- Complete audit trail

### 5. Advanced Reports
Visual and interactive sales reports for table channel:
- Sales per table
- Average ticket
- Turnover rate
- Occupancy heatmap
- Peak hours analysis

## Quick Start

### Configure Tables
1. Go to **Settings > Mesas & Layout**
2. Set total tables (e.g., 60)
3. Add sections with colors
4. Save configuration

### Use Waiter App
1. Open **Garçom** module
2. Select table
3. Add items to cart
4. Close table with payment

## Technical Documentation

- [Table Management](./table-management.md)
- [Payment Flow](./payment-flow.md)
- [Algorithms](./algorithms.md)
- [Reports](./reports.md)
- [Testing Guide](./testing.md)

## Performance Benchmarks

All algorithms tested with:
- 60 tables
- 500 products
- 200 concurrent orders

Results: **All operations < 2ms**

## Support

For issues or questions, contact support@summo.com.br
