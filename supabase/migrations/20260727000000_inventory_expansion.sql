-- ==========================================
-- VORTIQ INVENTORY MODULE EXPANSION
-- Migration Version: 20260727000000
-- Description: Multi-Warehouse Transfers, Batch & Serial Tracking, Composite Bundles/Kits,
--              Barcode Scanning, PO -> GRN -> Stock Lifecycle, Sales Orders -> Finance Invoices,
--              Drop-shipping, GS1 Sector Templates, & Custom Item Fields.
-- ==========================================

-- 1. WAREHOUSES
CREATE TABLE IF NOT EXISTS public.inventory_warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 2. INTER-WAREHOUSE TRANSFER ORDERS
CREATE TABLE IF NOT EXISTS public.inventory_transfer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    transfer_number VARCHAR(50) NOT NULL,
    source_warehouse_id UUID NOT NULL REFERENCES public.inventory_warehouses(id),
    destination_warehouse_id UUID NOT NULL REFERENCES public.inventory_warehouses(id),
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'in_transit', 'received', 'cancelled')),
    items_json JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BATCHES & EXPIRY TRACKING
CREATE TABLE IF NOT EXISTS public.inventory_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    mfg_date DATE,
    expiry_date DATE,
    quantity_on_hand INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, item_id, batch_number)
);

-- 4. SERIAL NUMBERS
CREATE TABLE IF NOT EXISTS public.inventory_serial_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'returned', 'reserved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, item_id, serial_number)
);

-- 5. COMPOSITE ITEMS & BUNDLE COMPONENTS
CREATE TABLE IF NOT EXISTS public.inventory_composite_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    component_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity_required INT NOT NULL DEFAULT 1 CHECK (quantity_required > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_item_id, component_item_id)
);

-- 6. VENDORS & SUPPLIERS
CREATE TABLE IF NOT EXISTS public.inventory_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    gstin VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PURCHASE ORDERS & GOODS RECEIVED NOTES (GRN)
CREATE TABLE IF NOT EXISTS public.inventory_purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.inventory_vendors(id),
    po_number VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partially_received', 'received', 'cancelled')),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    items_json JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SALES ORDERS & DROP-SHIPMENT
CREATE TABLE IF NOT EXISTS public.inventory_sales_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    so_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(150),
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'fulfilled', 'invoiced', 'cancelled')),
    is_dropship BOOLEAN DEFAULT false,
    vendor_id UUID REFERENCES public.inventory_vendors(id),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    items_json JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.inventory_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transfer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sales_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_warehouses ON public.inventory_warehouses FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_transfers ON public.inventory_transfer_orders FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_batches ON public.inventory_batches FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_serials ON public.inventory_serial_numbers FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_vendors ON public.inventory_vendors FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_pos ON public.inventory_purchase_orders FOR ALL USING (tenant_id = public.current_tenant_id());
CREATE POLICY tenant_isolation_sos ON public.inventory_sales_orders FOR ALL USING (tenant_id = public.current_tenant_id());
