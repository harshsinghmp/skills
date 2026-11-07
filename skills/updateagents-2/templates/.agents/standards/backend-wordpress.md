# 🌐 Modern WordPress & Headless Architecture Standards

> **Runtime Target**: PHP 8.2+ · Roots Bedrock · Composer · WP-CLI · Modern FSE Theme / Custom Blocks · WP REST API / WPGraphQL

---

## 1. Architecture & 12-Factor Isolation

- **Roots Bedrock Structure**:
  - Web root isolated to `web/` (`web/wp/` core, `web/app/` user content).
  - Configuration managed strictly through environment variables via `.env` (using `vlucas/phpdotenv`). Never hardcode database credentials or salts in `wp-config.php`.
  - All plugins, themes, and dependencies declared and managed via `composer.json` (WordPress Packagist `wpackagist-plugin/*`, `wpackagist-theme/*`).
- **Secret & Salt Security**:
  - Salts and database passwords must live in `.env` and be excluded from version control.
  - Never commit `.env` or database SQL dumps into git.

---

## 2. Block & Custom Theme Development

- **Block-First Architecture**:
  - New custom components must be built as Gutenberg blocks with `block.json` metadata standards.
  - Scripts and styles built via `@wordpress/scripts` with modern ESNext / JSX modules.
- **Security & Sanitization**:
  - **Late Escaping**: Always escape on output (`esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`).
  - **Early Sanitization**: Sanitize all incoming `$_POST`, `$_GET`, and request parameters (`sanitize_text_field()`, `absint()`, `rest_sanitize_*`).
  - **Database Queries**: Never execute raw concatenated SQL. Always use `$wpdb->prepare()` for dynamic parameter binding.
  - **Nonces & Permissions**: All custom AJAX/POST handlers and REST endpoints must verify nonces (`check_ajax_referer` / `wp_verify_nonce`) and check current user capabilities (`current_user_can()`).

---

## 3. Headless & API Conventions

- **WP REST API**:
  - Register custom routes under `myagency/v1` namespace using `register_rest_route()`.
  - Every route MUST declare a `permission_callback` function; never omit or return `__return_true` without explicit public audit rationale.
  - Return responses using `new WP_REST_Response($data, $status)`.
- **WPGraphQL**:
  - Prefer WPGraphQL for decoupled Next.js / Astro frontends.
  - Register custom types and fields strictly with schema definitions and authorization resolvers.

---

## 4. Quality, Linting & Testing

- **WordPress Coding Standards (WPCS)**:
  - Enforce PSR-12 / WordPress-Core coding standards via `phpcs` and `php-cs-fixer`.
- **Automated Testing**:
  - Unit tests run via `phpunit` or `pest-plugin-wordpress`.
  - Integration tests executed against isolated test databases or Docker `wp-env`.

---

## 5. Standard Commands

```bash
composer install        # Install PHP dependencies & plugins
npm install             # Install block editor / theme toolchain
npm run dev             # Watch and compile theme & block assets
npm run build           # Production asset compilation
wp core is-installed    # Verify WordPress install via WP-CLI
composer test           # Run PHPUnit test suite
composer phpcs          # Check WordPress coding standards
```
