-- Marketing content refresh: align services + page metadata with the
-- updated Go Gro Mobility positioning (mobility entrepreneurs).
--
-- Service detail_content is intentionally left null so the frontend renders
-- its code-based fallback (lib/data/service-details.ts). Description and
-- feature bullets are updated here so the services listing stays in sync.

-- Fuel Credit
update public.services
set name = 'Fuel Credit',
    description = 'Fuel today. Keep moving. Keep earning.',
    features = '["E-hailing and delivery drivers","Weekly repayment cycle","Growing partner fuel network"]'::jsonb,
    detail_content = null
where slug = 'fuel-credit';

-- Vehicle Rental
update public.services
set name = 'Vehicle Rental',
    description = 'Get a car. Get on the road. Start earning.',
    features = '["Reliable e-hailing vehicles","Simple four-step process","Built for e-hailing drivers"]'::jsonb,
    detail_content = null
where slug = 'vehicle-rental';

-- Vehicle Management
update public.services
set name = 'Vehicle Management',
    description = 'Your vehicle. Managed. Earning.',
    features = '["Driver sourcing and screening","Weekly rental collection","Maintenance and admin support"]'::jsonb,
    detail_content = null
where slug = 'vehicle-management';

-- Home page metadata
update public.pages
set meta_description = 'Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.',
    hero_subtitle = 'Helping mobility entrepreneurs move, operate and grow with fuel credit, vehicle rentals and vehicle management.'
where slug = 'home';

-- About page hero subtitle
update public.pages
set hero_subtitle = 'A mobility solutions company focused on helping entrepreneurs move, operate and grow.'
where slug = 'about';

-- Rewards page metadata
update public.pages
set meta_title = 'Driver Rewards & Benefits | Go Gro Mobility',
    hero_title = 'Driver Rewards & Benefits',
    hero_subtitle = 'Good account management unlocks more.'
where slug = 'rewards';
