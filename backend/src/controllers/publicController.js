// Public, unauthenticated carwash config for the booking site.
// Tenant is already resolved from the subdomain by the resolveTenant middleware,
// so we just return req.carwash — whitelisted to non-secret branding fields
// (NEVER expose telegram_bot_token / telegram_chat_id here).

// GET /api/public/config
exports.getConfig = async (req, res, next) => {
  try {
    const c = req.carwash;
    if (!c) return res.status(404).json({ error: 'Автомойка не найдена' });

    res.json({
      id:                c.id,
      slug:              c.slug,
      name:              c.name,
      logo_url:          c.logo_url,
      primary_color:     c.primary_color,
      accent_color:      c.accent_color,
      hero_title:        c.hero_title,
      hero_subtitle:     c.hero_subtitle,
      hero_image_url:    c.hero_image_url,
      phone:             c.phone,
      address:           c.address,
      instagram_url:     c.instagram_url,
      checklist_enabled: !!c.checklist_enabled,
    });
  } catch (err) {
    next(err);
  }
};
