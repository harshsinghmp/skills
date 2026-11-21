# cloud-waf — GCP Cloud Armor & Cloudflare WAF Architecture across 6 Well-Architected Pillars.

## Intake

- Target cloud perimeter configuration (GCP Cloud Armor security policies, Cloudflare WAF rules, AWS WAF)
- Load balancer endpoints and backend service topologies
- Traffic baseline (request rates, geographic distribution, bot traffic share)
- Default stack: GCP Cloud Armor / Cloudflare WAF.

## Deliverable

A comprehensive Cloud WAF architecture audit and rule hardening plan spanning all 6 Well-Architected Framework (WAF) pillars:
1. Security: L7 OWASP Top 10 rules, rate limiting, IP reputation, adaptive protection.
2. Reliability: High availability multi-region failover, DDoS auto-mitigation thresholds.
3. Performance: Caching bypass rules, TLS termination at edge, minimal rule evaluation latency.
4. Cost: WAF rule quota optimization, request inspection tier budgeting.
5. Operations: Log export to SIEM/Cloud Logging, alert thresholds, rule tuning loops.
6. Sustainability: Carbon-aware region routing (CFE% ≥ 80%).

## Procedure

1. **Security Pillar (Perimeter Defense)**:
   - Configure pre-configured WAF rulesets for OWASP Top 10 (SQLi, XSS, RFI/LFI, RCE).
   - Configure Layer 7 adaptive protection and ML-driven anomaly detection.
   - Implement rate-limiting rules per client IP / subnet (e.g. max 100 req/min for sensitive auth endpoints).

2. **Reliability & DDoS Defense**:
   - Enable SYN-flood, UDP reflection, and HTTP flood defenses.
   - Verify health check configs on backend load balancers.

3. **Performance & Caching**:
   - Ensure static asset requests bypass deep WAF inspection via edge caching.
   - Benchmark rule evaluation latency (< 5ms at edge).

4. **Operations & Logging**:
   - Stream WAF evaluation logs (`jsonPayload.enforcedSecurityPolicy.outcome`) to Cloud Logging / SIEM.
   - Set up automated alerts for rule trigger spikes (> 50 blocked requests / 5 min).

## Quality gate

- [ ] OWASP Top 10 pre-configured rules deployed in preview/enforce mode.
- [ ] Rate limiting active on authentication and API write endpoints.
- [ ] Static asset bypass configured for performance.
- [ ] Evaluation logs streaming to central observability with spike alerts.
- [ ] All 6 Well-Architected Framework pillars evaluated.

## Routing

- Host-level Linux fleet patching → `remediate` mode.
- In-dev developer input sanitization → `webdev` (backend).
